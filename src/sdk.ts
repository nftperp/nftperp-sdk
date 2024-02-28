import Big from "big.js";
import abis from "./abis";
import config from "./config";
import * as ethers from "ethers";
import * as types from "./types";
import * as utils from "./utils";
import * as apis from "./apis";

export class SDK {
    private readonly _provider: ethers.Provider;
    public readonly wallet?: ethers.Wallet;

    private readonly _ch: types.ClearingHouse;
    private readonly _weth: types.ERC20;

    private readonly _api: apis.NftperpApis;
    /**
     * @param params params for initing sdk
     * @param params.wallet ethers wallet class for signing txs
     * @param params.instance instance
     */
    constructor(params?: { rpcUrl?: string; privateKey?: string }) {
        const rpcUrl = params?.rpcUrl ?? config.rpcUrl;
        this._provider = new ethers.JsonRpcProvider(rpcUrl);
        void this._validateRpcNetwork(this._provider);

        if (params?.privateKey) this.wallet = new ethers.Wallet(params.privateKey, this._provider);

        const signerOrProvider = this.wallet ?? this._provider;
        const { ch, weth } = config.contracts;
        this._ch = new ethers.Contract(ch, abis.clearingHouse, signerOrProvider) as unknown as types.ClearingHouse;
        this._weth = new ethers.Contract(weth, abis.erc20, signerOrProvider) as unknown as types.ERC20;

        this._api = new apis.NftperpApis();
    }

    /**
     * Create a market order
     * @param params params for opening position
     * @param params.amm amm eg bayc
     * @param params.side BUY or SELL
     * @param params.margin margin
     * @param params.leverage leverage
     * @returns tx
     */
    public async createMarketOrder(
        params: {
            amm: types.Amm;
            side: types.Side;
            margin: number;
            leverage: number;
            slippagePercent?: number;
        },
        options?: { maxApprove?: boolean; skipChecks?: boolean },
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        const { amm, side, margin, leverage, slippagePercent } = params;

        this._checkWallet();
        this._checkAmm(amm);
        const summary = await this._api.openSummary({ amm, margin, leverage, side });
        if (!options?.skipChecks) {
            await this._checkBalance(utils.big(summary.totalCost));
            await this._checkAllowance(utils.big(summary.totalCost), options?.maxApprove);
        }
        const baseLimit = this._getSlippageBaseAmount(side, utils.big(summary.outputSize), slippagePercent);

        return this._openPosition(
            this._getAmmAddress(amm),
            side === types.Side.BUY ? 0 : 1,
            utils.toWeiStr(margin),
            utils.toWeiStr(leverage),
            utils.toWeiStr(baseLimit),
            overrides,
        );
    }

    /**
     * Create a limit order
     * @param params params for creating limit order
     * @param params.amm amm eg bayc
     * @param params.side BUY or SELL
     * @param params.price limit order price
     * @param params.margin margin
     * @param params.leverage leverage
     * @returns tx
     */
    public async createLimitOrder(
        params: {
            amm: types.Amm;
            side: types.Side;
            price: number;
            margin: number;
            leverage: number;
            reduceOnly?: boolean;
        },
        options?: { maxApprove?: boolean; skipChecks?: boolean },
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        const { amm, side, price, margin, leverage, reduceOnly } = params;

        this._checkWallet();
        this._checkAmm(amm);
        if (!options?.skipChecks && !reduceOnly) {
            await this._checkBalance(utils.big(margin));
            await this._checkAllowance(utils.big(margin), options?.maxApprove);
        }
        const trader = await this._getAddress();
        return this._ch.createLimitOrder(
            {
                trader,
                amm: this._getAmmAddress(amm),
                side: side === types.Side.BUY ? 0 : 1,
                trigger: utils.toWeiStr(price),
                quoteAmount: utils.toWeiStr(margin),
                leverage: utils.toWeiStr(leverage),
                reduceOnly: !!reduceOnly,
            },
            overrides,
        );
    }

    /**
     * Create a trigger order (sl/tp)
     * @param params params for creating trigger order
     * @param params.amm amm eg bayc
     * @param params.trigger trigger price
     * @param params.size size to execute
     * @param params.type SL or TP
     * @returns tx
     */
    public async createTriggerOrder(
        params: {
            amm: types.Amm;
            price: number;
            size: number;
            type: types.TriggerType;
        },
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        const { amm, price, size, type } = params;

        this._checkWallet();
        this._checkAmm(amm);
        const trader = await this._getAddress();
        return this._ch.createTriggerOrder(
            {
                trader,
                amm: this._getAmmAddress(amm),
                trigger: utils.toWeiStr(price),
                size: utils.toWeiStr(size),
                quoteLimit: 0,
                takeProfit: type === types.TriggerType.TAKE_PROFIT,
            },
            overrides,
        );
    }

    /**
     * Close position
     * @param params params for closing position
     * @param params.amm amm eg bayc
     * @returns tx
     */
    public async closePosition(
        params: {
            amm: types.Amm;
            closePercent?: number;
            slippagePercent?: number;
        },
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        const { amm, closePercent: _closePercent, slippagePercent } = params;

        this._checkWallet();
        this._checkAmm(amm);
        const closePercent = _closePercent ?? 100;
        const { size, trader, side } = await this.getPosition(amm);
        if (utils.big(size).eq(0)) {
            throw new Error("no position found");
        }
        const summary = await this._api.closeMarketSummary({
            amm,
            trader,
            closePercent,
        });
        const quoteAssetAmountLimit = this._getSlippageQuoteAssetAmount(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            side!,
            utils.big(summary.outputNotional),
            slippagePercent,
        );

        return this._closePosition(
            this._getAmmAddress(amm),
            utils.toWeiStr(utils.big(size).mul(closePercent).div(100).abs()),
            utils.toWeiStr(quoteAssetAmountLimit),
            overrides,
        );
    }

    /**
     * Update a limit order
     * @param id order id
     * @param params params for creating limit order
     * @param params.amm amm eg bayc
     * @param params.side BUY or SELL
     * @param params.price limit order price
     * @param params.margin margin
     * @param params.leverage leverage
     * @param params.reduceOnly reduce only
     * @returns tx
     */
    public async updateLimitOrder(
        id: number,
        params: {
            amm: types.Amm;
            side: types.Side;
            price: number;
            margin: number;
            leverage: number;
            reduceOnly?: boolean;
        },
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        const { amm, side, price, margin, leverage, reduceOnly } = params;

        this._checkWallet();
        this._checkAmm(amm);
        const trader = await this._getAddress();
        return this._ch.updateLimitOrder(
            id,
            {
                trader,
                amm: this._getAmmAddress(amm),
                side: side === types.Side.BUY ? 0 : 1,
                trigger: utils.toWeiStr(price),
                quoteAmount: utils.toWeiStr(margin),
                leverage: utils.toWeiStr(leverage),
                reduceOnly: !!reduceOnly,
            },
            overrides,
        );
    }

    /**
     * Delete a limit order
     * @param id order id
     * @returns tx
     */
    public async deleteLimitOrder(
        id: number,
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        this._checkWallet();
        return this._ch.deleteLimitOrder(id, overrides);
    }

    /**
     * Delete a trigger order
     * @param id order id
     * @returns tx
     */
    public async deleteTriggerOrder(
        id: number,
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        this._checkWallet();
        return this._ch.deleteTriggerOrder(id, overrides);
    }

    /**
     * Create limit order batch
     * @param params limit order params
     * @returns tx
     */
    public async createLimitOrderBatch(
        params: {
            amm: types.Amm;
            side: types.Side;
            price: number;
            margin: number;
            leverage: number;
            reduceOnly?: boolean;
        }[],
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        this._checkWallet();
        params.map((p) => this._checkAmm(p.amm));
        const trader = await this._getAddress();

        return this._ch.createLimitOrderBatch(
            params.map((p) => ({
                trader,
                amm: this._getAmmAddress(p.amm),
                side: p.side === types.Side.BUY ? 0 : 1,
                trigger: utils.toWeiStr(p.price),
                quoteAmount: utils.toWeiStr(p.margin),
                leverage: utils.toWeiStr(p.leverage),
                reduceOnly: !!p.reduceOnly,
            })),
            overrides,
        );
    }

    /**
     * Delete limit order batch
     * @param ids order ids
     * @returns tx
     */
    public async deleteLimitOrderBatch(
        ids: number[],
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        this._checkWallet();
        return this._ch.deleteLimitOrderBatch(ids, overrides);
    }

    /**
     * Update limit order batch
     * @param ids orders ids to update
     * @param params new limit order params
     * @returns tx
     */
    public async updateLimitOrderBatch(
        ids: number[],
        params: {
            amm: types.Amm;
            side: types.Side;
            price: number;
            margin: number;
            leverage: number;
            reduceOnly?: boolean;
        }[],
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        this._checkWallet();
        params.map((p) => this._checkAmm(p.amm));
        const trader = await this._getAddress();

        return this._ch.updateLimitOrderBatch(
            ids,
            params.map((p) => ({
                trader,
                amm: this._getAmmAddress(p.amm),
                side: p.side === types.Side.BUY ? 0 : 1,
                trigger: utils.toWeiStr(p.price),
                quoteAmount: utils.toWeiStr(p.margin),
                leverage: utils.toWeiStr(p.leverage),
                reduceOnly: !!p.reduceOnly,
            })),
            overrides,
        );
    }

    /**
     * Add margin to position. increases margin ratio (position health)
     * @param params params for adding margin
     * @param params.amm amm eg bayc
     * @param params.amount margin to add
     * @returns tx
     */
    public async addMargin(
        params: { amm: types.Amm; amount: number },
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        const { amm, amount } = params;

        this._checkWallet();
        this._checkAmm(amm);
        const { size } = await this.getPosition(amm);
        if (utils.big(size).eq(0)) {
            throw new Error("no position found");
        }
        await this._checkBalance(utils.big(amount));
        await this._checkAllowance(utils.big(amount));

        return this._addMargin(this._getAmmAddress(amm), utils.toWeiStr(amount), overrides);
    }

    /**
     * Remove margin from position. decreases margin ratio and increases liq price
     * @param params params for removing margin
     * @param params.amm amm eg bayc
     * @param params.amount margin to remove
     * @returns tx
     */
    public async removeMargin(
        params: { amm: types.Amm; amount: number },
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        const { amm, amount } = params;

        this._checkWallet();
        this._checkAmm(amm);
        const { size, trader } = await this.getPosition(amm);
        if (utils.big(size).eq(0)) {
            throw new Error("no position found");
        }
        const freeCollateral = await this._api.freeCollateral(amm, trader);
        if (utils.big(amount).gt(freeCollateral)) {
            throw new Error("remove amount beyond free collateral");
        }

        return this._removeMargin(this._getAmmAddress(amm), utils.toWeiStr(amount), overrides);
    }

    public async approve(params: {
        amount?: number | string;
        max?: boolean;
    }): Promise<ethers.ContractTransactionResponse> {
        const { amount, max } = params;
        if (!amount && !max) {
            throw new Error("specify either amount or max option");
        }
        return this._approve(utils.toWeiStr(amount || 0), !!max);
    }

    /**
     * Get position
     * @param amm amm eg bayc
     * @returns position
     */
    public async getPosition(amm: types.Amm, trader?: string): Promise<types.PositionResponse> {
        if (!this.wallet && !trader) throw new Error(`mising param: trader`);
        this._checkAmm(amm);
        return this._api.position(amm, trader ?? (await this._getAddress()));
    }

    /**
     * Get maker position
     * @param amm amm eg bayc
     * @returns position
     */
    public async getMakerPosition(amm: types.Amm, trader?: string): Promise<types.MakerPositionResponse> {
        if (!this.wallet && !trader) throw new Error(`mising param: trader`);
        this._checkAmm(amm);
        return this._api.makerPosition(amm, trader ?? (await this._getAddress()));
    }

    /**
     * Get all limit orders
     * @returns all orders
     */
    public async getLimitOrders(amm: types.Amm, trader?: string): Promise<types.LimitOrder[]> {
        if (!this.wallet && !trader) throw new Error(`mising param: trader`);
        this._checkAmm(amm);
        return this._api.orders(amm, trader);
    }

    /**
     * Get trigger orders
     * @returns all trigger orders
     */
    public async getTriggerOrders(amm: types.Amm, trader?: string): Promise<types.TriggerOrder[]> {
        if (!this.wallet && !trader) throw new Error(`mising param: trader`);
        this._checkAmm(amm);
        return await this._api.triggerOrders(amm, trader ?? (await this._getAddress()));
    }

    /**
     * Get orderbook
     * @returns orderbook
     */
    public async getOrderbook(amm: types.Amm): Promise<types.OrderBook> {
        this._checkAmm(amm);
        return this._api.orderbook(amm);
    }

    /**
     * Get balances
     * @returns balances
     */
    public async getBalances(trader?: string): Promise<types.BalancesResponse> {
        if (!this.wallet && !trader) throw new Error(`mising param: trader`);
        return this._api.balances(trader ?? (await this._getAddress()));
    }

    /**
     * get open pos summary
     * @param params.amm amm eg bayc
     * @param params.amount collateral amount
     * @param params.leverage leverage
     * @param params.side buy or sell
     * @returns open pos summary
     */
    public async getOpenSummary(params: {
        amm: types.Amm;
        side: types.Side;
        margin: number;
        leverage: number;
    }): Promise<types.OpenSummaryResponse> {
        const { amm, margin, leverage, side } = params;

        this._checkAmm(amm);
        return this._api.openSummary({
            amm,
            margin,
            leverage,
            side,
        });
    }

    /**
     * get closes pos tx summary (market)
     * @param params.amm amm eg bayc
     * @param params.closePercent percent to close
     * @returns close pos market summary
     */
    public async getCloseMarketSummary(params: {
        amm: types.Amm;
        closePercent?: number;
    }): Promise<types.CloseSummaryResponse> {
        const { amm, closePercent } = params;

        this._checkWallet();
        this._checkAmm(amm);
        const trader = await this._getAddress();
        return this._api.closeMarketSummary({
            amm,
            trader,
            closePercent: closePercent ?? 100,
        });
    }

    /**
     * get close pos tx summary (limit)
     * @param params.amm amm eg bayc
     * @param params.limit limit order price
     * @returns close pos limit summary
     */
    public async getCloseLimitSummary(params: {
        amm: types.Amm;
        price: number;
        closePercent?: number;
    }): Promise<types.CloseSummaryResponse> {
        const { amm, price: trigger, closePercent } = params;

        this._checkWallet();
        this._checkAmm(amm);
        const trader = await this._getAddress();
        return this._api.closeLimitSummary({
            amm,
            trader,
            trigger,
            closePercent: closePercent ?? 100,
        });
    }

    /**
     * get upnl
     * @param amm amm eg bayc
     * @returns upnl in `eth`
     */
    public async getUpnl(amm: types.Amm, trader?: string): Promise<string> {
        if (!this.wallet && !trader) throw new Error(`mising param: trader`);
        this._checkAmm(amm);
        const { size, unrealizedPnl } = await this._api.position(amm, trader ?? (await this._getAddress()));
        if (utils.big(size).eq(0)) {
            throw new Error("no position found");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return unrealizedPnl!;
    }

    /**
     * get funding payment
     * @param amm amm eg bayc
     * @returns funding payment in `eth`
     */
    public async getFundingPayment(amm: types.Amm): Promise<string> {
        this._checkAmm(amm);
        const trader = await this._getAddress();
        const { size, fundingPayment } = await this._api.position(amm, trader);
        if (utils.big(size).eq(0)) {
            throw new Error("no position found");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return fundingPayment!;
    }

    /**
     * get liquidation price
     * @param amm amm eg bayc
     * @returns liquidation price in `eth`
     */
    public async getLiquidationPrice(amm: types.Amm, trader?: string): Promise<string> {
        if (!this.wallet && !trader) throw new Error(`mising param: trader`);
        this._checkAmm(amm);
        const { size, liquidationPrice } = await this._api.position(amm, trader ?? (await this._getAddress()));
        if (utils.big(size).eq(0)) {
            throw new Error("no position found");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return liquidationPrice!;
    }

    /**
     * get max leverage for amm
     * @param amm amm eg bayc
     * @returns max leverage
     */
    public async getMaxLeverage(amm: types.Amm): Promise<number> {
        this._checkAmm(amm);
        const ammInfo = await this._api.ammInfo(amm);
        return utils.numerify(utils.big(1).div(ammInfo.initMarginRatio));
    }

    /**
     * Get mark price (trading price)
     * @param amm amm eg bayc
     * @returns mark price
     */
    public async getMarkPrice(amm: types.Amm): Promise<string> {
        this._checkAmm(amm);
        return this._api.markPrice(amm);
    }

    /**
     * Get index price (oracle price - as per marketplaces)
     * @param amm amm eg bayc
     * @returns index price
     */
    public async getIndexPrice(amm: types.Amm): Promise<string> {
        this._checkAmm(amm);
        return this._api.indexPrice(amm);
    }

    /**
     * Get funding info
     * @param amm amm eg bayc
     * @returns funding info
     */
    public async getFundingRate(amm: types.Amm): Promise<string> {
        this._checkAmm(amm);
        return this._api.fundingRate(amm);
    }

    /**
     * Get amm info
     * @param amm amm eg bayc
     * @returns amm Info
     */
    public async getAmmInfo(amm: types.Amm): Promise<types.AmmInfoResponse> {
        this._checkAmm(amm);
        return this._api.ammInfo(amm);
    }

    /**
     * Get margin ratio. margin ratio = active margin / active notional
     * @param params.amm amm eg bayc
     * @returns margin ratio
     */
    public async getMaintenanceMarginRatio(amm: types.Amm): Promise<string> {
        this._checkAmm(amm);
        const { maintenanceMarginRatio } = await this._api.ammInfo(amm);
        return maintenanceMarginRatio;
    }

    /**
     * Get trades
     * @param params.amm amm eg bayc
     * @param params.trader trader address
     * @param params.from from timestamp unix (in seconds, inclusive)
     * @param params.to to timestamp unix (in seconds, inclusive)
     * @param params.sort asc or desc
     * @param params.page page number for pagination
     * @param parans.pageSize limit per page
     * @returns trade info
     */
    public async getTrades(params?: types.TradeApiParams) {
        if (params?.amm) this._checkAmm(params.amm);
        return this._api.marketTrades(params);
    }

    /**
     * Get trades
     * @param params.amm amm eg bayc
     * @param params.from from timestamp unix (in seconds, inclusive)
     * @param params.to to timestamp unix (in seconds, inclusive)
     * @param params.sort asc or desc
     * @param params.page page number for pagination
     * @param parans.pageSize limit per page
     * @returns funding info
     */
    public async getFundings(params?: types.FundingApiParams) {
        if (params?.amm) this._checkAmm(params.amm);
        return this._api.fundings(params);
    }

    /**
     * Get supported Amms
     * @returns Amms
     */
    public getSupportedAmms(): (keyof typeof types.Amm)[] {
        return Object.keys(config.contracts.amms) as (keyof typeof types.Amm)[];
    }

    /**
     * Get contract addresses
     * @returns Amms
     */
    public getContracts(): typeof config.contracts {
        return config.contracts;
    }

    //
    // PRIVATE
    //

    /**
     * get base asset amount limit
     * @requires baseAssetOut in `eth`
     * @returns base asset amount limit in `eth`
     */
    private _getSlippageBaseAmount(side: types.Side, baseAssetOut: Big, slippagePercent = 0): Big {
        if (!slippagePercent) return utils.big(0);
        const slippageAmount = baseAssetOut.mul(slippagePercent).div(100);
        if (side === types.Side.BUY) {
            return baseAssetOut.sub(slippageAmount);
        }
        return baseAssetOut.add(slippageAmount);
    }

    /**
     * get quote asset amount limit
     * @param `side` side of existing position
     * @requires outputNotional in `eth`
     * @returns quote asset amount limit `eth`
     */
    private _getSlippageQuoteAssetAmount(side: types.Side, outputNotional: Big, slippagePercent = 0): Big {
        if (!slippagePercent) return utils.big(0);
        const slippageAmount = outputNotional.mul(slippagePercent).div(100);
        if (side === types.Side.BUY) {
            return outputNotional.sub(slippageAmount);
        }
        return outputNotional.add(slippageAmount);
    }

    /**
     * get balance of quote token
     * @returns balance in `eth`
     */
    private async _getBalance(): Promise<Big> {
        return utils.fromWei(await this._weth.balanceOf(await this._getAddress()));
    }

    /**
     * throws if balance below amount
     * @requires amount in `eth`
     */
    private async _checkBalance(amount: Big): Promise<void> {
        const balance = await this._getBalance();
        if (balance.lt(amount)) {
            throw new Error(`insufficient balance, required: ${utils.stringify(amount)}`);
        }
    }

    /**
     * allowance of quote token on clearing house
     * @returns allowance in `eth`
     */
    private async _getAllowance(): Promise<Big> {
        return utils.fromWei(await this._weth.allowance(await this._getAddress(), await this._ch.getAddress()));
    }

    /**
     * approves if allowance less than amount
     * @requires amount in `eth`
     */
    private async _checkAllowance(amount: Big, maxApprove = true): Promise<void> {
        const allowance = await this._getAllowance();
        if (allowance.lt(amount)) {
            await this._approve(utils.toWeiStr(amount), maxApprove);
        }
    }

    /**
     * sets approval on clearing house
     * @returns tx
     */
    private async _approve(amount: string, maxApprove: boolean): Promise<ethers.ContractTransactionResponse> {
        const tx = await this._weth.approve(await this._ch.getAddress(), maxApprove ? ethers.MaxUint256 : amount);
        return tx;
    }

    /**
     * open market order
     * @returns tx
     */
    private async _openPosition(
        amm: string,
        side: number,
        margin: string,
        leverage: string,
        baseLimit: string,
        overrides: ethers.ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        return this._ch.openPosition(amm, side, margin, leverage, baseLimit, overrides);
    }

    /**
     * close position
     * @returns hash
     */
    private async _closePosition(
        amm: string,
        size: string,
        quoteLimit: string,
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        return this._ch.closePosition(amm, size, quoteLimit, overrides);
    }

    /**
     * add margin
     * @returns tx
     */
    private async _addMargin(
        amm: string,
        marginToAdd: string,
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        return this._ch.addMargin(amm, marginToAdd, overrides);
    }

    /**
     * remove margin
     * @returns tx
     */
    private async _removeMargin(
        amm: string,
        marginToRemove: string,
        overrides: ethers.Overrides = {},
    ): Promise<ethers.ContractTransactionResponse> {
        return this._ch.removeMargin(amm, marginToRemove, overrides);
    }

    /**
     * get amm address
     */
    private _getAmmAddress(amm: types.Amm): string {
        return config.contracts.amms[amm];
    }

    /**
     * validate rpc and instance match
     */
    private async _validateRpcNetwork(provider: ethers.Provider) {
        const { chainId } = await provider.getNetwork();
        if (Number(chainId) !== config.chainId) {
            throw new Error("provider rpc and instance do not match");
        }
    }

    /**
     * get signer address
     */
    private async _getAddress(): Promise<string> {
        const addy = this.wallet!.address ?? (await this.wallet!.getAddress());
        if (!addy) throw new Error("signer has no address attached");
        return addy;
    }

    /**
     * check whether amm supported for instance
     */
    private _checkAmm(amm: types.Amm) {
        const amms = this.getSupportedAmms();
        if (amms.includes(amm.toUpperCase() as Uppercase<types.Amm>)) {
            throw new Error(`amm: ${amm} not supported`);
        }
    }

    /**
     * check wallet exists for write
     */
    private _checkWallet() {
        if (!this.wallet) {
            throw new Error(`sdk initialized as read-only, as private key is not provided`);
        }
    }
}
