import { constants, Contract, Overrides, Wallet } from "ethers";
import { ClearingHouse, ERC20 } from "./typechain-types";
import abis from "./abis";
import Big from "big.js";
import io, { Socket } from "socket.io-client";
import { getAmmAddress, getInstanceConfig } from "./utils/configDao";
import { big, fromWei, stringify, toDecimalWei } from "./utils/format";
import {
    Amm,
    AmmInfoResponse,
    AmmInfosResponse,
    CalcFeeResponse,
    ClosePosTxSummaryResponse,
    Decimal,
    EVENT,
    FundingApiParams,
    FundingInfoResponse,
    Instance,
    PositionResponse,
    Side,
    StatsApiResponse,
    TradeApiParams,
    TransactionSummaryResponse,
} from "./types";
import NftperpApis from "./services/api";
import { config } from "./config";

export class SDK {
    private readonly _wallet: Wallet;
    private readonly _instance: Instance;

    private readonly _ch: ClearingHouse;
    private readonly _weth: ERC20;

    private readonly _api: NftperpApis;
    private readonly _socket: Socket;
    /**
     * @param params params for initing sdk
     * @param params.wallet ethers wallet class for signing txs
     * @param params.instance instance
     */
    constructor(params: { wallet: Wallet; instance: Instance }) {
        const { wallet, instance } = params;
        void this._validateWalletAndInstance(wallet, instance);

        const { ch, weth } = getInstanceConfig(instance);
        this._ch = new Contract(ch, abis.clearingHouse, wallet) as ClearingHouse;
        this._weth = new Contract(weth, abis.erc20Abi, wallet) as ERC20;

        this._wallet = wallet;
        this._instance = instance;

        this._api = new NftperpApis(instance);
        this._socket = io(config[instance].apiBaseUrl.replace(`https`, "wss"));
    }

    /**
     * Open a new position
     * @param params params for opening position
     * @param params.amm the amm to trade eg bayc
     * @param params.side buy or sell
     * @param params.amount margin
     * @param params.leverage leverage
     * @returns tx hash
     */
    public async openPosition(
        params: {
            amm: Amm;
            side: Side;
            amount: number;
            leverage: number;
            slippagePercent?: number;
        },
        overrides?: Overrides
    ): Promise<string> {
        const { amm, side, amount, leverage, slippagePercent } = params;

        this._checkAmm(amm);
        const trader = await this._getAddress();
        const txSummary = await this._api.transactionSummary(amm, {
            amount,
            leverage,
            side,
            trader,
        });
        await this._checkBalance(big(txSummary.totalCost));
        await this._checkAllowance(big(txSummary.totalCost));
        const baseAssetAmountLimit = this._getSlippageBaseAssetAmount(
            side,
            big(txSummary.outputSize),
            slippagePercent
        );

        return await this._openPosition(
            this._getAmmAddress(amm),
            side === Side.BUY ? 0 : 1,
            toDecimalWei(amount),
            toDecimalWei(leverage),
            toDecimalWei(baseAssetAmountLimit),
            overrides
        );
    }

    /**
     * Close position
     * @param params params for closing position
     * @param params.amm amm eg bayc
     * @returns tx hash
     */
    public async closePosition(
        params: {
            amm: Amm;
            closePercent?: number;
            slippagePercent?: number;
        },
        overrides?: Overrides
    ): Promise<string> {
        const { amm, closePercent: _closePercent, slippagePercent } = params;

        // validate params
        this._checkAmm(amm);
        const closePercent = _closePercent ?? 100;
        const { size, trader, side } = await this.getPosition(amm);
        if (big(size).eq(0)) {
            throw new Error("no position found");
        }
        const txSummary = await this._api.closePosTransactionSummary(amm, {
            trader,
            closePercent,
        });
        const quoteAssetAmountLimit = this._getSlippageQuoteAssetAmount(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            side!,
            big(txSummary.outputNotional),
            slippagePercent
        );

        if (closePercent < 100) {
            return await this._partialClose(
                this._getAmmAddress(amm),
                toDecimalWei(closePercent / 100),
                toDecimalWei(quoteAssetAmountLimit),
                overrides
            );
        }
        return await this._closePosition(
            this._getAmmAddress(amm),
            toDecimalWei(quoteAssetAmountLimit),
            overrides
        );
    }

    /**
     * Add margin to position. increases margin ratio and position health
     * @param params params for adding margin
     * @param params.amm amm eg bayc
     * @param params.amount margin to add
     * @returns tx hash
     */
    public async addMargin(
        params: { amm: Amm; amount: number },
        overrides?: Overrides
    ): Promise<string> {
        const { amm, amount } = params;
        const { size } = await this.getPosition(amm);
        if (big(size).eq(0)) {
            throw new Error("no position found");
        }
        await this._checkBalance(big(amount));
        await this._checkAllowance(big(amount));

        return await this._addMargin(this._getAmmAddress(amm), toDecimalWei(amount), overrides);
    }

    /**
     * Remove margin from position. decreases margin ratio and increases liq price
     * @param params params for removing margin
     * @param params.amm amm eg bayc
     * @param params.amount margin to remove
     * @returns
     */
    public async removeMargin(
        params: { amm: Amm; amount: number },
        overrides?: Overrides
    ): Promise<string> {
        const { amm, amount } = params;
        const { size, trader } = await this.getPosition(amm);
        if (big(size).eq(0)) {
            throw new Error("no position found");
        }
        const freeCollateral = await this._api.freeCollateral(amm, trader);
        if (big(amount).gt(freeCollateral)) {
            throw new Error("remove amount beyond free collateral");
        }

        return await this._removeMargin(this._getAmmAddress(amm), toDecimalWei(amount), overrides);
    }

    /**
     * Get all positions
     * @returns all positions
     */
    public async getAllPositions(trader?: string): Promise<{ [key in Amm]: PositionResponse }> {
        const positions = await this._api.positions(trader ?? (await this._getAddress()));
        return positions;
    }

    /**
     * Get position
     * @param amm amm eg bayc
     * @returns position
     */
    public async getPosition(amm: Amm, trader?: string): Promise<PositionResponse> {
        const position = await this._api.position(amm, trader ?? (await this._getAddress()));
        return position;
    }

    /**
     * calc fee
     * @param params.amm amm eg bayc
     * @param params.amount collateral amount
     * @param params.leverage leverage
     * @param params.side buy or sell
     * @param params.open is opening position?
     * @returns fee in `eth`
     */
    public async calcFee(params: {
        amm: Amm;
        amount: number;
        leverage: number;
        side: Side;
        open: boolean;
    }): Promise<CalcFeeResponse> {
        const { amm, amount, leverage, side, open } = params;
        const feeData = await this._api.calcFee(amm, { amount, leverage, side, open });
        return feeData;
    }

    /**
     * get open pos tx summary
     * @param params.amm amm eg bayc
     * @param params.amount collateral amount
     * @param params.leverage leverage
     * @param params.side buy or sell
     * @returns open pos tx summary
     */
    public async getOpenPosTxSummary(params: {
        amm: Amm;
        amount: number;
        leverage: number;
        side: Side;
    }): Promise<TransactionSummaryResponse> {
        const { amm, amount, leverage, side } = params;
        const trader = await this._getAddress();
        const txSummary = await this._api.transactionSummary(amm, {
            amount,
            leverage,
            side,
            trader,
        });
        return txSummary;
    }

    /**
     * get open pos tx summary
     * @param params.amm amm eg bayc
     * @param params.closePercent percent to close
     * @returns close pos tx summary
     */
    public async getClosePosTxSummary(params: {
        amm: Amm;
        closePercent?: number;
    }): Promise<ClosePosTxSummaryResponse> {
        const { amm, closePercent } = params;
        const trader = await this._getAddress();
        const txSummary = await this._api.closePosTransactionSummary(amm, {
            trader,
            closePercent: closePercent ?? 100,
        });
        return txSummary;
    }

    /**
     * get upnl
     * @param amm amm eg bayc
     * @returns upnl in `eth`
     */
    public async getUpnl(amm: Amm): Promise<string> {
        const trader = await this._getAddress();
        const { size, unrealizedPnl } = await this._api.position(amm, trader);
        if (big(size).eq(0)) {
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
    public async getFundingPayment(amm: Amm): Promise<string> {
        const trader = await this._getAddress();
        const { size, fundingPayment } = await this._api.position(amm, trader);
        if (big(size).eq(0)) {
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
    public async getLiquidationPrice(amm: Amm, trader?: string): Promise<string> {
        const { size, liquidationPrice } = await this._api.position(
            amm,
            trader ?? (await this._getAddress())
        );
        if (big(size).eq(0)) {
            throw new Error("no position found");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return liquidationPrice!;
    }

    /**
     * Get margin ratio. margin ratio = active margin / active notional
     * @param params.amm amm eg bayc
     * @returns margin ratio
     */
    public async getMarginRatio(amm: Amm, trader?: string): Promise<string> {
        const { size, marginRatio } = await this._api.position(
            amm,
            trader ?? (await this._getAddress())
        );
        if (big(size).eq(0)) {
            throw new Error("no position found");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return marginRatio!;
    }

    /**
     * get max leverage for amm
     * @param amm amm eg bayc
     * @returns max leverage
     */
    public async getMaxLeverage(amm: Amm): Promise<string> {
        const ammInfo = await this._api.ammInfo(amm);
        return stringify(big(1).div(ammInfo.initMarginRatio));
    }

    /**
     * Get mark price (trading price)
     * @param amm amm eg bayc
     * @returns mark price
     */
    public async getMarkPrice(amm: Amm): Promise<string> {
        const markPrice = await this._api.markPrice(amm);
        return markPrice;
    }

    /**
     * Get index price (oracle price - as per marketplaces)
     * @param amm amm eg bayc
     * @returns index price
     */
    public async getIndexPrice(amm: Amm): Promise<string> {
        const indexPrice = await this._api.indexPrice(amm);
        return indexPrice;
    }

    /**
     * Get funding info
     * @param amm amm eg bayc
     * @returns funding info
     */
    public async getFundingInfo(amm: Amm): Promise<FundingInfoResponse> {
        const fundingInfo = await this._api.fundingInfo(amm);
        return fundingInfo;
    }

    /**
     * Get mark price twap
     * @param amm amm eg bayc
     * @returns mark price twap interval
     */
    public async getMarkPriceTwap(amm: Amm): Promise<string> {
        const markPriceTwap = await this._api.markPriceTwap(amm);
        return markPriceTwap;
    }

    /**
     * Get mark price twap interval
     * @param amm amm eg bayc
     * @returns mark price twap interval
     */
    public async getMarkPriceTwapinterval(amm: Amm): Promise<string> {
        const markPriceTwapInterval = await this._api.markPriceTwapInterval(amm);
        return markPriceTwapInterval;
    }

    /**
     * Get amm info
     * @param amm amm eg bayc
     * @returns amm Info
     */
    public async getAmmInfo(amm: Amm): Promise<AmmInfoResponse> {
        const ammInfo = await this._api.ammInfo(amm);
        return ammInfo;
    }

    /**
     * Get all amm infos
     * @returns amm Infos
     */
    public async getAllAmmInfos(): Promise<AmmInfosResponse> {
        const ammInfos = await this._api.ammInfos();
        return ammInfos;
    }

    /**
     * Get margin ratio. margin ratio = active margin / active notional
     * @param params.amm amm eg bayc
     * @returns margin ratio
     */
    public async getMaintenanceMarginRatio(amm: Amm): Promise<string> {
        const { maintenanceMarginRatio } = await this._api.ammInfo(amm);
        return maintenanceMarginRatio;
    }

    /**
     * Get trades
     * @param params.amm amm eg bayc
     * @param params.trader trader address
     * @param params.hash transaction hash
     * @param params.from from timestamp unix (in seconds, inclusive)
     * @param params.to to timestamp unix (in seconds, inclusive)
     * @param params.sort asc or desc
     * @param params.page page number for pagination
     * @param parans.pageSize limit per page
     * @returns trade info
     */
    public async getTrades(params?: TradeApiParams) {
        const result = await this._api.trades(params);
        return result;
    }

    /**
     * Get trades
     * @param params.amm amm eg bayc
     * @param params.hash transaction hash
     * @param params.from from timestamp unix (in seconds, inclusive)
     * @param params.to to timestamp unix (in seconds, inclusive)
     * @param params.sort asc or desc
     * @param params.page page number for pagination
     * @param parans.pageSize limit per page
     * @returns trade info
     */
    public async getFundings(params?: FundingApiParams) {
        const result = await this._api.fundings(params);
        return result;
    }

    /**
     * event streamer
     * @param event event name eg TRADE
     * @param callback fn yielding the event data
     */
    public on<T = any>(event: EVENT, callback: (data: StatsApiResponse<T>) => any) {
        this._socket.on(event, callback);
    }

    /**
     * Get supported Amms
     * @returns Amms
     */
    public getSupportedAmms(instance: Instance): (keyof typeof Amm)[] {
        const { amms } = getInstanceConfig(instance);
        return Object.keys(amms) as (keyof typeof Amm)[];
    }

    //
    // PRIVATE
    //

    /**
     * get base asset amount limit
     * @requires baseAssetOut in `eth`
     * @returns base asset amount limit in `eth`
     */
    private _getSlippageBaseAssetAmount(side: Side, baseAssetOut: Big, slippagePercent = 0): Big {
        if (!slippagePercent) return big(0);
        const slippageAmount = baseAssetOut.mul(slippagePercent).div(100);
        if (side === Side.BUY) {
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
    private _getSlippageQuoteAssetAmount(
        side: Side,
        outputNotional: Big,
        slippagePercent = 0
    ): Big {
        if (!slippagePercent) return big(0);
        const slippageAmount = outputNotional.mul(slippagePercent).div(100);
        if (side === Side.BUY) {
            return outputNotional.sub(slippageAmount);
        }
        return outputNotional.add(slippageAmount);
    }

    /**
     * get balance of quote token
     * @returns balance in `eth`
     */
    private async _getBalance(): Promise<Big> {
        return fromWei(await this._weth.balanceOf(await this._getAddress()));
    }

    /**
     * throws if balance below amount
     * @requires amount in `eth`
     */
    private async _checkBalance(amount: Big): Promise<void> {
        const balance = await this._getBalance();
        if (balance.lt(amount)) {
            throw new Error(`insufficient balance, required: ${stringify(amount)}`);
        }
    }

    /**
     * allowance of quote token on clearing house
     * @returns allowance in `eth`
     */
    private async _getAllowance(): Promise<Big> {
        return fromWei(await this._weth.allowance(await this._getAddress(), this._ch.address));
    }

    /**
     * sets max approval on clearing house
     * @returns hash
     */
    private async _maxApprove(): Promise<string> {
        const tx = await this._weth.approve(this._ch.address, constants.MaxUint256);
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
     * open position
     * @returns hash
     */
    private async _openPosition(
        amm: string,
        side: number,
        margin: Decimal,
        leverage: Decimal,
        baseAssetAmountLimit: Decimal,
        overrides?: Overrides
    ): Promise<string> {
        const tx = await this._ch.openPosition(
            amm,
            side,
            margin,
            leverage,
            baseAssetAmountLimit,
            overrides
        );
        return tx.hash;
    }

    /**
     * close position
     * @returns hash
     */
    private async _closePosition(
        amm: string,
        quoteAssetAmountLimit: Decimal,
        overrides?: Overrides
    ) {
        const tx = await this._ch.closePosition(amm, quoteAssetAmountLimit, overrides);
        return tx.hash;
    }

    /**
     * partial close
     * @returns hash
     */
    private async _partialClose(
        amm: string,
        partialCloseRatio: Decimal,
        quoteAssetAmountLimit: Decimal,
        overrides?: Overrides
    ): Promise<string> {
        const tx = await this._ch.partialClose(
            amm,
            partialCloseRatio,
            quoteAssetAmountLimit,
            overrides
        );
        return tx.hash;
    }

    /**
     * add margin
     * @returns hash
     */
    private async _addMargin(amm: string, marginToAdd: Decimal, overrides?: Overrides) {
        const tx = await this._ch.addMargin(amm, marginToAdd, overrides);
        return tx.hash;
    }

    /**
     * remove margin
     * @returns hash
     */
    private async _removeMargin(
        amm: string,
        marginToRemove: Decimal,
        overrides?: Overrides
    ): Promise<string> {
        const tx = await this._ch.removeMargin(amm, marginToRemove, overrides);
        return tx.hash;
    }

    /**
     * get amm address
     */
    private _getAmmAddress(amm: Amm): string {
        return getAmmAddress(this._instance, amm);
    }

    /**
     * validate rpc and instance match
     */
    private async _validateWalletAndInstance(wallet: Wallet, instance: Instance) {
        if (!wallet.provider) {
            throw new Error("wallet has no provider attached");
        }
        const { chainId } = await wallet.provider.getNetwork();
        if (chainId !== getInstanceConfig(instance).chainId) {
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
    private _checkAmm(amm: Amm) {
        const amms = this.getSupportedAmms(this._instance);
        if (!amms.includes(amm)) {
            throw new Error(`amm: ${amm} not supported on instance: ${this._instance}`);
        }
    }
}
