import Big from "big.js";
import abis from "./abis";
import * as ethers from "ethers";
import * as types from "./types";
import * as utils from "./utils";
import * as apis from "./apis";

export class SDK {
    private readonly _wallet: ethers.Wallet;
    private readonly _instance: types.Instance;

    private readonly _ch: types.ClearingHouse;
    private readonly _weth: types.ERC20;

    private readonly _api: apis.NftperpApis;
    /**
     * @param params params for initing sdk
     * @param params.wallet ethers wallet class for signing txs
     * @param params.instance instance
     */
    constructor(params: { wallet: ethers.Wallet; instance?: types.Instance }) {
        const { wallet, instance = types.Instance.PAPER_TRADING } = params;
        void this._validateWalletAndInstance(wallet, instance);

        const { ch, weth } = utils.getInstanceConfig(instance);
        this._ch = new ethers.Contract(ch, abis.clearingHouse, wallet) as types.ClearingHouse;
        this._weth = new ethers.Contract(weth, abis.erc20Abi, wallet) as types.ERC20;

        this._wallet = wallet;
        this._instance = instance;

        this._api = new apis.NftperpApis(instance);
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
    public async openMarketOrder(
        params: {
            amm: types.Amm;
            side: types.Side;
            margin: number;
            leverage: number;
            slippagePercent?: number;
        },
        overrides?: ethers.ethers.Overrides
    ): Promise<ethers.ethers.ContractTransaction> {
        const { amm, side, margin, leverage, slippagePercent } = params;

        this._checkAmm(amm);
        const summary = await this._api.openSummary({ amm, margin, leverage, side });
        await this._checkBalance(utils.big(summary.totalCost));
        await this._checkAllowance(utils.big(summary.totalCost));
        const baseLimit = this._getSlippageBaseAmount(side, utils.big(summary.outputSize), slippagePercent);

        return this._openPosition(
            this._getAmmAddress(amm),
            side === types.Side.BUY ? 0 : 1,
            utils.toWeiStr(margin),
            utils.toWeiStr(leverage),
            utils.toWeiStr(baseLimit),
            overrides
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
    public async openLimitOrder(
        params: {
            amm: types.Amm;
            side: types.Side;
            price: string;
            margin: string;
            leverage: string;
            reduceOnly?: boolean;
        },
        overrides?: ethers.ethers.Overrides
    ): Promise<ethers.ethers.ContractTransaction> {
        const { amm, side, price, margin, leverage, reduceOnly } = params;

        const trader = await this._getAddress();
        return this._ch.createLimitOrder(
            {
                trader,
                amm: this._getAmmAddress(amm),
                side,
                trigger: utils.toWeiStr(price),
                quoteAmount: utils.toWeiStr(margin),
                leverage: utils.toWeiStr(leverage),
                reduceOnly: !!reduceOnly,
            },
            overrides
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
    public async openTriggerOrder(
        params: {
            amm: types.Amm;
            price: string;
            size: string;
            type: types.TriggerType;
        },
        overrides?: ethers.Overrides
    ): Promise<ethers.ContractTransaction> {
        const { amm, price, size, type } = params;

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
            overrides
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
        overrides?: ethers.Overrides
    ): Promise<ethers.ContractTransaction> {
        const { amm, closePercent: _closePercent, slippagePercent } = params;

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
            slippagePercent
        );

        return this._closePosition(
            this._getAmmAddress(amm),
            utils.toWeiStr(utils.big(size).mul(closePercent).div(100)),
            utils.toWeiStr(quoteAssetAmountLimit),
            overrides
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
            price: string;
            margin: string;
            leverage: string;
            reduceOnly?: boolean;
        },
        overrides?: ethers.Overrides
    ): Promise<ethers.ContractTransaction> {
        const { amm, side, price, margin, leverage, reduceOnly } = params;

        const trader = await this._getAddress();
        return this._ch.updateLimitOrder(
            id,
            {
                trader,
                amm: this._getAmmAddress(amm),
                side,
                trigger: utils.toWeiStr(price),
                quoteAmount: utils.toWeiStr(margin),
                leverage: utils.toWeiStr(leverage),
                reduceOnly: !!reduceOnly,
            },
            overrides
        );
    }

    /**
     * Delete a limit order
     * @param id order id
     * @returns tx
     */
    public async deleteLimitOrder(id: string, overrides?: ethers.Overrides): Promise<ethers.ContractTransaction> {
        return this._ch.deleteLimitOrder(id, overrides);
    }

    /**
     * Delete a trigger order
     * @param id order id
     * @param amm amm eg bayc
     * @returns tx
     */
    public async deleteTriggerOrder(
        id: string,
        amm: types.Amm,
        overrides?: ethers.Overrides
    ): Promise<ethers.ContractTransaction> {
        return this._ch.deleteTriggerOrder(id, this._getAmmAddress(amm), overrides);
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
        overrides?: ethers.Overrides
    ): Promise<ethers.ContractTransaction> {
        const { amm, amount } = params;
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
        overrides?: ethers.Overrides
    ): Promise<ethers.ContractTransaction> {
        const { amm, amount } = params;
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

    /**
     * Get position
     * @param amm amm eg bayc
     * @returns position
     */
    public async getPosition(amm: types.Amm, trader?: string): Promise<types.PositionResponse> {
        return this._api.position(amm, trader ?? (await this._getAddress()));
    }

    /**
     * Get all positions
     * @returns all positions
     */
    public async getAllPositions(trader?: string): Promise<{ [key in types.Amm]: types.PositionResponse }> {
        const positions = await this._api.positions(trader ?? (await this._getAddress()));
        return positions;
    }

    /**
     * Get maker position
     * @param amm amm eg bayc
     * @returns position
     */
    public async getMakerPosition(amm: types.Amm, trader?: string): Promise<types.MakerPositionResponse> {
        return this._api.makerPosition(amm, trader ?? (await this._getAddress()));
    }

    /**
     * Get open orders
     * @returns all orders
     */
    public async getOpenLimitOrders(amm: types.Amm, trader?: string): Promise<types.Order[]> {
        return this._api.orders(amm, trader ?? (await this._getAddress()));
    }

    /**
     * Get all trigger orders
     * @returns all trigger orders
     */
    public async getOpenTriggerOrders(amm: types.Amm): Promise<types.Order[]> {
        const orders = await this._api.triggerOrders(amm, await this._getAddress());
        return orders;
    }

    /**
     * Get orderbook
     * @returns orderbook
     */
    public async getOrderbook(amm: types.Amm): Promise<types.OrderBook> {
        return this._api.orderbook(amm);
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
    public async getUpnl(amm: types.Amm): Promise<string> {
        const trader = await this._getAddress();
        const { size, unrealizedPnl } = await this._api.position(amm, trader);
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
    public async getMaxLeverage(amm: types.Amm): Promise<string> {
        const ammInfo = await this._api.ammInfo(amm);
        return utils.stringify(utils.big(1).div(ammInfo.initMarginRatio));
    }

    /**
     * Get mark price (trading price)
     * @param amm amm eg bayc
     * @returns mark price
     */
    public async getMarkPrice(amm: types.Amm): Promise<string> {
        return this._api.markPrice(amm);
    }

    /**
     * Get index price (oracle price - as per marketplaces)
     * @param amm amm eg bayc
     * @returns index price
     */
    public async getIndexPrice(amm: types.Amm): Promise<string> {
        return this._api.indexPrice(amm);
    }

    /**
     * Get funding info
     * @param amm amm eg bayc
     * @returns funding info
     */
    public async getFundingRate(amm: types.Amm): Promise<string> {
        return this._api.fundingRate(amm);
    }

    /**
     * Get amm info
     * @param amm amm eg bayc
     * @returns amm Info
     */
    public async getAmmInfo(amm: types.Amm): Promise<types.AmmInfoResponse> {
        return this._api.ammInfo(amm);
    }

    /**
     * Get all amm infos
     * @returns amm Infos
     */
    public async getAllAmmInfos(): Promise<types.AmmInfosResponse> {
        const ammInfos = await this._api.ammInfos();
        return ammInfos;
    }

    /**
     * Get margin ratio. margin ratio = active margin / active notional
     * @param params.amm amm eg bayc
     * @returns margin ratio
     */
    public async getMaintenanceMarginRatio(amm: types.Amm): Promise<string> {
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
        return this._api.fundings(params);
    }

    /**
     * Get supported Amms
     * @returns Amms
     */
    public getSupportedAmms(instance: types.Instance): (keyof typeof types.Amm)[] {
        const { amms } = utils.getInstanceConfig(instance);
        return Object.keys(amms) as (keyof typeof types.Amm)[];
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
        return utils.fromWei(await this._weth.allowance(await this._getAddress(), this._ch.address));
    }

    /**
     * sets max approval on clearing house
     * @returns hash
     */
    private async _maxApprove(): Promise<string> {
        const tx = await this._weth.approve(this._ch.address, ethers.constants.MaxUint256);
        return tx.hash;
    }

    /**
     * approves if allowance less than amount
     * @requires amount in `eth`
     */
    private async _checkAllowance(amount: Big): Promise<void> {
        const allowance = await this._getAllowance();
        if (allowance.lt(amount)) {
            await this._maxApprove();
        }
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
        overrides: ethers.ethers.Overrides = {}
    ): Promise<ethers.ethers.ContractTransaction> {
        return this._ch.openPosition(amm, side, margin, leverage, baseLimit, overrides);
    }

    /**
     * close position
     * @returns hash
     */
    private async _closePosition(amm: string, size: string, quoteLimit: string, overrides: ethers.Overrides = {}) {
        return this._ch.closePosition(amm, size, quoteLimit, overrides);
    }

    /**
     * add margin
     * @returns tx
     */
    private async _addMargin(
        amm: string,
        marginToAdd: string,
        overrides: ethers.Overrides = {}
    ): Promise<ethers.ContractTransaction> {
        return this._ch.addMargin(amm, marginToAdd, overrides);
    }

    /**
     * remove margin
     * @returns tx
     */
    private async _removeMargin(
        amm: string,
        marginToRemove: string,
        overrides: ethers.Overrides = {}
    ): Promise<ethers.ContractTransaction> {
        return this._ch.removeMargin(amm, marginToRemove, overrides);
    }

    /**
     * get amm address
     */
    private _getAmmAddress(amm: types.Amm): string {
        return utils.getAmmAddress(this._instance, amm);
    }

    /**
     * validate rpc and instance match
     */
    private async _validateWalletAndInstance(wallet: ethers.Wallet, instance: types.Instance) {
        if (!wallet.provider) {
            throw new Error("wallet has no provider attached");
        }
        const { chainId } = await wallet.provider.getNetwork();
        if (chainId !== utils.getInstanceConfig(instance).chainId) {
            throw new Error("provider rpc and instance do not match");
        }
    }

    /**
     * get signer address
     */
    private async _getAddress(): Promise<string> {
        const addy = this._wallet.address ?? (await this._wallet.getAddress());
        if (!addy) throw new Error("signer has no address attached");
        return addy;
    }

    /**
     * check whether amm supported for instance
     */
    private _checkAmm(amm: types.Amm) {
        const amms = this.getSupportedAmms(this._instance);
        if (amms.includes(amm.toUpperCase() as Uppercase<types.Amm>)) {
            throw new Error(`amm: ${amm} not supported on instance: ${this._instance}`);
        }
    }
}
