import { constants, Contract, Wallet } from "ethers";
import {
    Amm,
    AmmInfo,
    Decimal,
    DirectionOfAsset,
    Instance,
    OpenInterestInfo,
    Position,
    PositionDisplay,
    Ratios,
    Reserves,
    Side,
} from "./types";
import {
    Amm as AmmContract,
    ClearingHouse,
    ClearingHouseViewer,
    MockWETH,
    InsuranceFund,
} from "./typechain-types";
import abis from "./abis";
import Big from "big.js";
import { format, fromDecimal, fromWei, toBig, toDecimal, toWei } from "./utils/math/mathUtil";
import { _throw } from "./utils/common/commonUtil";
import { getAmmAddress, getInstanceConfig } from "./utils/dao/configDao";

export class SDK {
    private readonly _wallet: Wallet;
    private readonly _instance: Instance;

    private readonly _ch: ClearingHouse;
    private readonly _chv: ClearingHouseViewer;
    private readonly _if: InsuranceFund;
    private readonly _weth: MockWETH;
    /**
     * @param params params for initing sdk
     * @param params.wallet ethers wallet class for signing txs
     * @param params.instance instance
     */
    constructor(params: { wallet: Wallet; instance: Instance }) {
        const { wallet, instance } = params;
        void this._validateWalletAndInstance(wallet, instance);

        const { ch, chv, iF, weth } = getInstanceConfig(instance);
        this._ch = new Contract(ch, abis.chAbi, wallet) as ClearingHouse;
        this._chv = new Contract(chv, abis.chvAbi, wallet) as ClearingHouseViewer;
        this._if = new Contract(iF, abis.ifAbi, wallet) as InsuranceFund;
        this._weth = new Contract(weth, abis.mockWethAbi, wallet) as MockWETH;

        this._wallet = wallet;
        this._instance = instance;
    }

    /**
     * Get mock weth from faucet for paper trading on beta
     * @returns `5` mock weth
     */
    public async useFaucet(): Promise<string> {
        if (this._instance !== Instance.BETA) {
            _throw("faucet is only available for beta instance");
        }
        const tx = await this._weth.mint();
        return tx.hash;
    }

    /**
     * Open a new position
     * @param params params for opening position
     * @param params.amm the amm to trade eg bayc
     * @param params.side buy or sell
     * @param params.margin collateral amount
     * @param params.leverage leverage
     * @returns tx hash
     */
    public async openPosition(params: {
        amm: Amm;
        side: Side;
        margin: number;
        leverage: number;
        slippagePercent?: number;
    }): Promise<string> {
        const { amm, side, margin, leverage, slippagePercent } = params;
        const notional = toBig(margin).mul(leverage);
        const fees = await this._calcFee(amm, toWei(notional), side);
        const totalCost = toWei(margin).add(fees);
        await this._checkBalance(totalCost);
        await this._checkAllowance(totalCost);
        const slippageAmount = await this._getSlippageBaseAssetAmount(
            amm,
            side,
            notional,
            slippagePercent
        );

        return await this._openPosition(
            this._getAmmAddress(amm),
            side,
            toDecimal(toWei(margin)),
            toDecimal(toWei(leverage)),
            toDecimal(slippageAmount)
        );
    }

    /**
     * Close position
     * @param params params for closing position
     * @param params.amm amm eg bayc
     * @returns tx hash
     */
    public async closePosition(params: { amm: Amm; slippagePercent?: number }): Promise<string> {
        const { amm, slippagePercent } = params;
        const { size } = await this._getPosition(amm);
        if (size.eq(0)) {
            _throw("no position found");
        }
        // closing long is equivalent of shorting
        const side = size.gt(0) ? Side.SELL : Side.BUY;
        const slippageAmount = await this._getSlippageQuoteAssetAmount(
            amm,
            side,
            size,
            slippagePercent
        );

        return await this._closePosition(this._getAmmAddress(amm), toDecimal(slippageAmount));
    }

    /**
     * Partially close position
     * @param params params for partially closing position
     * @param params.amm amm eg bayc
     * @param params.partialClosePercent percentage of position to close
     * @returns tx hash
     */
    public async partialClose(params: {
        amm: Amm;
        partialClosePercent: number;
        slippagePercent?: number;
    }) {
        const { amm, partialClosePercent, slippagePercent } = params;
        const { size } = await this._getPosition(amm);
        if (size.eq(0)) {
            _throw("no such position");
        }
        const side = size.gt(0) ? Side.SELL : Side.BUY;
        const partialCloseFraction = toBig(partialClosePercent).div(100);
        const sizeToClose = size.mul(partialCloseFraction).round(0, 0);
        const slippageAmount = await this._getSlippageQuoteAssetAmount(
            amm,
            side,
            sizeToClose,
            slippagePercent
        );

        return await this._partialClose(
            this._getAmmAddress(amm),
            toDecimal(toWei(partialCloseFraction)),
            toDecimal(slippageAmount)
        );
    }

    /**
     * Add margin to position. increases margin ratio and position health
     * @param params params for adding margin
     * @param params.amm amm eg bayc
     * @param params.marginToAdd margin to add
     * @returns tx hash
     */
    public async addMargin(params: { amm: Amm; marginToAdd: number }): Promise<string> {
        const { amm, marginToAdd } = params;
        const { size } = await this._getPosition(amm);
        if (size.eq(0)) {
            _throw("no position found");
        }
        await this._checkBalance(toWei(marginToAdd));
        await this._checkAllowance(toWei(marginToAdd));

        return await this._addMargin(this._getAmmAddress(amm), toDecimal(toWei(marginToAdd)));
    }

    /**
     * Remove margin from position. decreases margin ratio and increases liq price
     * @param params params for removing margin
     * @param params.amm amm eg bayc
     * @param params.marginToRemove margin to remove
     * @returns
     */
    public async removeMargin(params: { amm: Amm; marginToRemove: number }): Promise<string> {
        const { amm, marginToRemove } = params;
        const { size, margin } = await this._getPositionWithFundingPayment(amm);
        if (size.eq(0)) {
            _throw("no position found");
        }
        const { positionNotional, upnl } = await this._getPositionNotionalAndUpnl(amm);
        const { mmr } = await this._getRatios(amm);
        const newMarginRatio = margin.add(upnl).sub(toWei(marginToRemove)).div(positionNotional);
        if (newMarginRatio.lt(mmr)) {
            _throw(
                "position goes below mmr after removal. try removing a small amount to keep above mmr"
            );
        }

        return await this._removeMargin(this._getAmmAddress(amm), toDecimal(toWei(marginToRemove)));
    }

    /**
     * Get position
     * @param params.amm amm eg bayc
     * @returns position
     */
    public async getPosition(params: { amm: Amm; trader?: string }): Promise<PositionDisplay> {
        const { amm, trader } = params;
        const { size, margin, openNotional } = await this._getPosition(amm, trader);
        if (size.eq(0)) {
            return {
                size: 0,
                margin: 0,
                leverage: 0,
                pnl: 0,
                funding: 0,
                entryPrice: null,
                liquidationPrice: null,
            };
        }
        const liquidationPrice = await this._getLiquidationPrice(amm, trader);
        const { upnl } = await this._getPositionNotionalAndUpnl(amm, trader);
        const { margin: marginWithFunding } = await this._getPositionWithFundingPayment(
            amm,
            trader
        );
        const pnl = format(fromWei(upnl), 4);
        const funding = format(fromWei(marginWithFunding.sub(margin)), 4);
        return {
            size: format(fromWei(size)),
            margin: format(fromWei(margin)),
            leverage: format(openNotional.div(margin)),
            pnl: pnl === 0 ? 0 : pnl, // to remove -0
            funding: funding === 0 ? 0 : funding,
            entryPrice: format(openNotional.div(size.abs())),
            liquidationPrice: format(liquidationPrice),
        };
    }

    /**
     * Get margin ratio. margin ratio = active margin / active notional
     * @param params.amm amm eg bayc
     * @returns margin ratio
     */
    public async getMarginRatio(params: { amm: Amm; trader?: string }): Promise<number> {
        const { amm, trader } = params;
        const mr = await this._getMarginRatio(amm, trader);
        return format(fromWei(mr), undefined, true);
    }

    /**
     * Get mark price (nftperp price)
     * @param amm amm eg bayc
     * @returns mark price
     */
    public async getMarkPrice(amm: Amm) {
        const spotPrice = await this._getSpotPrice(amm);
        return format(fromWei(spotPrice));
    }

    /**
     * Get index price (real price - as per marketplaces)
     * @param amm amm eg bayc
     * @returns index price
     */
    public async getIndexPrice(amm: Amm) {
        const indexPrice = await this._getUnderlyingPrice(amm);
        return format(fromWei(indexPrice));
    }

    /**
     * Get funding details
     * @param amm amm eg bayc
     * @returns funding period and next funding time, prev funding rate (`wei`)
     */
    public async getFundingInfo(amm: Amm): Promise<{
        fundingPeriod: number;
        nextFundingTime: number;
        previousFundingPercent: number;
    }> {
        const ammInstance = this._getAmmInstance(amm);
        const fundingPeriod = await ammInstance.fundingPeriod();
        const nextFundingTime = await ammInstance.nextFundingTime();
        const previousFundingRate = await ammInstance.fundingRate();
        return {
            fundingPeriod: format(toBig(fundingPeriod)),
            nextFundingTime: format(toBig(nextFundingTime)),
            previousFundingPercent: format(fromWei(previousFundingRate).mul(100)),
        };
    }

    /**
     * Get asset info
     * @param amm amm eg bayc
     * @returns Amm Info
     */
    public async getAmmInfo(amm: Amm): Promise<AmmInfo> {
        const markPrice = await this._getSpotPrice(amm);
        const indexPrice = await this._getUnderlyingPrice(amm);
        const { nextFundingTime, previousFundingPercent } = await this.getFundingInfo(amm);
        const { openInterest, openInterestLongs, openInterestShorts } =
            await this._getOpenInterestInfo(amm);
        const { imr, mmr, lfr } = await this._getRatios(amm);
        return {
            amm,
            markPrice: format(fromWei(markPrice)),
            indexPrice: format(fromWei(indexPrice)),
            maxLeverage: format(toWei(1).div(imr)),
            maintenanceMarginPercent: format(fromWei(mmr).mul(100)),
            fullLiquidationPercent: format(fromWei(lfr).mul(100)),
            previousFundingPercent,
            nextFundingTime,
            openInterest: format(fromWei(openInterest)),
            openInterestLongs: format(fromWei(openInterestLongs)),
            openInterestShorts: format(fromWei(openInterestShorts)),
        };
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
     * get notional longs and shorts
     * @returns open interest info in `wei`
     */
    private async _getOpenInterestInfo(amm: Amm): Promise<OpenInterestInfo> {
        const { openInterest, openInterestLongs, openInterestShorts } =
            await this._ch.openInterestMap(this._getAmmAddress(amm));
        return {
            openInterestLongs: fromDecimal(openInterestLongs),
            openInterestShorts: fromDecimal(openInterestShorts),
            openInterest: fromDecimal(openInterest),
        };
    }

    /**
     * get spot price
     * @returns spot price in `wei`
     */
    private async _getSpotPrice(amm: Amm): Promise<Big> {
        const ammInstance = this._getAmmInstance(amm);
        const spotPrice = await ammInstance.getSpotPrice();
        return fromDecimal(spotPrice);
    }

    /**
     * get underlying price
     * @returns underlying price in `wei`
     */
    private async _getUnderlyingPrice(amm: Amm): Promise<Big> {
        const ammInstance = this._getAmmInstance(amm);
        const underlyingPrice = await ammInstance.getUnderlyingPrice();
        return fromDecimal(underlyingPrice);
    }

    /**
     * get trader position
     * @returns position (size, margin, notional) in `wei`
     */
    private async _getPosition(amm: Amm, trader?: string): Promise<Position> {
        const { size, margin, openNotional } = await this._ch.getPosition(
            this._getAmmAddress(amm),
            trader ?? (await this._getAddress())
        );
        return {
            size: fromDecimal(size),
            margin: fromDecimal(margin),
            openNotional: fromDecimal(openNotional),
        };
    }

    /**
     * get liquidation price
     * https://www.notion.so/New-liquidation-price-formula-exact-solution-6fc007bd28134f1397d13c8a6e6c1fbc
     *
     * @returns liq price in `eth`
     */
    private async _getLiquidationPrice(amm: Amm, trader?: string): Promise<Big> {
        const ratios = await this._getRatios(amm);
        const position = await this._getPositionWithFundingPayment(amm, trader);
        const reserves = await this._getReserves(amm);
        const size = fromWei(position.size);
        if (size.eq(0)) return toBig(0);
        const margin = fromWei(position.margin);
        const openNotional = fromWei(position.openNotional);
        const mmr = fromWei(ratios.mmr);
        const k = fromWei(reserves.quoteAssetReserve).mul(fromWei(reserves.baseAssetReserve));
        const pn = size.gt(0)
            ? margin.minus(openNotional).div(mmr.minus(1))
            : margin.add(openNotional).div(mmr.add(1));
        const x = size.gte(0)
            ? size
                  .mul(-0.5)
                  .add(size.mul(pn).pow(2).add(pn.mul(k).mul(size).mul(4)).sqrt().div(pn.mul(2)))
            : size
                  .mul(-0.5)
                  .add(
                      size.mul(pn).pow(2).minus(pn.mul(k).mul(size).mul(4)).sqrt().div(pn.mul(-2))
                  );
        return k.div(x.pow(2));
    }

    /**
     * get reserves
     * @returns quote asset reserve (y) and base asset reserve (x) in `wei`
     */
    private async _getReserves(amm: Amm): Promise<Reserves> {
        const ammInstance = this._getAmmInstance(amm);
        const [quoteAssetReserve, baseAssetReserve] = await ammInstance.getReserves();
        return {
            quoteAssetReserve: fromDecimal(quoteAssetReserve),
            baseAssetReserve: fromDecimal(baseAssetReserve),
        };
    }

    /**
     * get position with funding payment (margin is inclusive of funding)
     * @returns position (size, margin, notional) in `wei`
     */
    private async _getPositionWithFundingPayment(amm: Amm, trader?: string): Promise<Position> {
        const { size, margin, openNotional } =
            await this._chv.getPersonalPositionWithFundingPayment(
                this._getAmmAddress(amm),
                trader ?? (await this._getAddress())
            );
        return {
            size: fromDecimal(size),
            margin: fromDecimal(margin),
            openNotional: fromDecimal(openNotional),
        };
    }

    /**
     * get margin ratio
     * @returns margin ratio in `wei`
     */
    private async _getMarginRatio(amm: Amm, trader?: string): Promise<Big> {
        const marginRatio = await this._ch.getMarginRatio(
            this._getAmmAddress(amm),
            trader ?? (await this._getAddress())
        );
        return fromDecimal(marginRatio);
    }

    /**
     * get active notional and upnl
     * @returns pn and upnl in `wei`
     */
    private async _getPositionNotionalAndUpnl(amm: Amm, trader?: string) {
        const _ = await this._ch.getPositionNotionalAndUnrealizedPnl(
            this._getAmmAddress(amm),
            trader ?? (await this._getAddress()),
            0
        );
        return {
            positionNotional: fromDecimal(_.positionNotional),
            upnl: fromDecimal(_.unrealizedPnl),
        };
    }

    /**
     * get imr, mmr, plr, lfr
     * @returns ratios in `wei`
     */
    private async _getRatios(amm: Amm): Promise<Ratios> {
        const ammInstance = this._getAmmInstance(amm);
        const ratios = await ammInstance.getRatios();
        return {
            imr: fromDecimal(ratios.initMarginRatio),
            mmr: fromDecimal(ratios.maintenanceMarginRatio),
            plr: fromDecimal(ratios.partialLiquidationRatio),
            lfr: fromDecimal(ratios.liquidationFeeRatio),
        };
    }

    /**
     * calc fees
     * @requires notional in `wei`
     * @returns fees in `wei`
     */
    private async _calcFee(amm: Amm, notional: Big, side: Side) {
        const ammInstance = this._getAmmInstance(amm);
        const fees = await ammInstance.calcFee(toDecimal(notional), side);
        return fromDecimal(fees[0]).add(fromDecimal(fees[1]));
    }

    /**
     * get base asset out
     * @requires notional in `eth`
     * @returns base asset out in `wei`
     */
    private async _getBaseAssetOut(amm: Amm, dir: DirectionOfAsset, notional: Big): Promise<Big> {
        const ammInstance = this._getAmmInstance(amm);
        const baseAssetOut = await ammInstance.getInputPrice(dir, toDecimal(toWei(notional)));
        return fromDecimal(baseAssetOut);
    }

    /**
     * get quote asset out
     * @requires size in `wei`
     * @returns quote asset out in `wei`
     */
    private async _getQuoteAssetOut(amm: Amm, dir: DirectionOfAsset, size: Big): Promise<Big> {
        const ammInstance = this._getAmmInstance(amm);
        const quoteAssetOut = await ammInstance.getOutputPrice(dir, toDecimal(size));
        return fromDecimal(quoteAssetOut);
    }

    /**
     * get base asset amount limit
     * @requires notional in `eth`
     * @returns base asset amount limit in `wei`
     */
    private async _getSlippageBaseAssetAmount(
        amm: Amm,
        side: Side,
        notional: Big,
        slippagePercent?: number
    ): Promise<Big> {
        if (!slippagePercent) {
            return toBig(0);
        }
        // direction of quote
        const dir =
            side === Side.BUY ? DirectionOfAsset.ADD_TO_AMM : DirectionOfAsset.REMOVE_FROM_AMM;
        const baseAssetOut = await this._getBaseAssetOut(amm, dir, notional);
        const slippageFraction = Big(slippagePercent).div(100);
        if (side === Side.BUY) {
            return baseAssetOut.mul(toBig(1).sub(slippageFraction)).round(0, 0); // round down
        }
        return baseAssetOut.mul(toBig(1).add(slippageFraction)).round(0, 1); // round up
    }

    /**
     * get quote asset amount limit
     * @requires size in `wei`
     * @returns quote asset amount limit `wei`
     */
    private async _getSlippageQuoteAssetAmount(
        amm: Amm,
        side: Side,
        size: Big,
        slippagePercent?: number
    ): Promise<Big> {
        if (!slippagePercent) {
            return toBig(0);
        }
        // direction of base
        const dir =
            side === Side.SELL ? DirectionOfAsset.ADD_TO_AMM : DirectionOfAsset.REMOVE_FROM_AMM;
        const quoteAssetOut = await this._getQuoteAssetOut(amm, dir, size);
        const slippageFraction = Big(slippagePercent).div(100);
        if (side === Side.SELL) {
            return quoteAssetOut.mul(toBig(1).sub(slippageFraction)).round(0, 0);
        }
        return quoteAssetOut.mul(toBig(1).add(slippageFraction)).round(0, 1);
    }

    /**
     * get balance of quote token
     * @returns balance in `wei`
     */
    private async _getBalance(): Promise<Big> {
        return toBig(await this._weth.balanceOf(await this._getAddress()));
    }

    /**
     * throws if balance below amount
     * @requires amount in `wei`
     */
    private async _checkBalance(amount: Big): Promise<void> {
        const balance = await this._getBalance();
        if (balance.lt(amount)) {
            _throw(`insufficient balance, required: ${format(fromWei(amount))}`);
        }
    }

    /**
     * allowance of quote token on clearing house
     * @returns allowance in `wei`
     */
    private async _getAllowance(): Promise<Big> {
        return toBig(await this._weth.allowance(await this._getAddress(), this._ch.address));
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
     * @requires amount in `wei`
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
        side: Side,
        margin: Decimal,
        leverage: Decimal,
        baseAssetAmountLimit: Decimal
    ): Promise<string> {
        const tx = await this._ch.openPosition(
            amm,
            side,
            margin,
            leverage,
            baseAssetAmountLimit,
            false
        );
        return tx.hash;
    }

    /**
     * close position
     * @returns hash
     */
    private async _closePosition(amm: string, quoteAssetAmountLimit: Decimal) {
        const tx = await this._ch.closePosition(amm, quoteAssetAmountLimit, false);
        return tx.hash;
    }

    /**
     * partial close
     * @returns hash
     */
    private async _partialClose(
        amm: string,
        partialCloseRatio: Decimal,
        quoteAssetAmountLimit: Decimal
    ): Promise<string> {
        const tx = await this._ch.partialClose(
            amm,
            partialCloseRatio,
            quoteAssetAmountLimit,
            false
        );
        return tx.hash;
    }

    /**
     * add margin
     * @returns hash
     */
    private async _addMargin(amm: string, marginToAdd: Decimal) {
        const tx = await this._ch.addMargin(amm, marginToAdd);
        return tx.hash;
    }

    /**
     * remove margin
     * @returns hash
     */
    private async _removeMargin(amm: string, marginToRemove: Decimal): Promise<string> {
        const tx = await this._ch.removeMargin(amm, marginToRemove);
        return tx.hash;
    }

    /**
     * get amm instance to interact with amm
     */
    private _getAmmInstance(amm: Amm): AmmContract {
        return new Contract(this._getAmmAddress(amm), abis.ammAbi, this._wallet) as AmmContract;
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
        const { chainId } = await wallet.provider.getNetwork();
        if (chainId !== getInstanceConfig(instance).chainId) {
            _throw("provider rpc and instance do not match");
        }
    }

    /**
     * get signer address
     */
    private async _getAddress(): Promise<string> {
        const addy = this._wallet.address ?? (await this._wallet.getAddress());
        if (!addy) _throw("signer has no account attached");
        return addy;
    }
}
