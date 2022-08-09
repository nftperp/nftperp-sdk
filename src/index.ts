import { constants, Contract, Wallet } from "ethers";
import { Asset, Decimal, Direction, OpenPositionParams, Side } from "./types/types";
import { Amm, ClearingHouse, ClearingHouseViewer, ERC20, InsuranceFund } from "./typechain-types";
import abis from "./abis";
import Big from "big.js";
import { format, fromDecimal, fromWei, toBig, toDecimal, toWei } from "./abis/utils/math/mathUtil";
import {
    getChAddress,
    getChvAddress,
    getAssetAddress,
    getIfAddress,
    getWethAddress,
    _throw,
} from "./abis/utils/helpers/helperUtil";

export class NFTPERP {
    private readonly _wallet: Wallet;

    private readonly _ch: ClearingHouse;
    private readonly _chv: ClearingHouseViewer;
    private readonly _if: InsuranceFund;
    private readonly _weth: ERC20;
    /**
     * @param wallet_ wallet signer used for making transactions
     */
    constructor(wallet_: Wallet) {
        this._wallet = wallet_;

        this._ch = new Contract(getChAddress(), abis.chAbi, wallet_) as ClearingHouse;
        this._chv = new Contract(getChvAddress(), abis.chvAbi, wallet_) as ClearingHouseViewer;
        this._if = new Contract(getIfAddress(), abis.ifAbi, wallet_) as InsuranceFund;
        this._weth = new Contract(getWethAddress(), abis.erc20Abi, wallet_) as ERC20;
    }

    /**
     * @description open a new position
     * @returns tx hash
     */
    public async openPosition(params: OpenPositionParams): Promise<string> {
        const { asset, direction, margin, leverage } = params;
        const notional = toBig(margin).mul(leverage);
        const side = this._getSide(direction);
        const fees = await this._calcFee(asset, notional, side);
        const totalCost = toWei(margin).add(fees);
        await this._checkBalance(totalCost);
        await this._checkAllowance(totalCost);
        const slippageAmount = await this._getSlippageBaseAssetAmount(params);

        const hash = await this._openPosition(
            getAssetAddress(asset),
            side,
            toDecimal(toWei(margin)),
            toDecimal(toWei(leverage)),
            toDecimal(slippageAmount)
        );
        return hash;
    }

    private async _calcFee(asset: Asset, notional: Big, side: Side) {
        const collectionInstance = this._getCollectionInstance(asset);
        const fees = await collectionInstance.calcFee(toDecimal(toWei(notional)), side);
        return fromDecimal(fees[0]).add(fromDecimal(fees[1]));
    }

    private async _getAllowance(): Promise<Big> {
        return toBig(await this._weth.allowance(this._wallet.address, this._ch.address));
    }

    private async _maxApprove(): Promise<void> {
        const tx = await this._weth.approve(this._ch.address, constants.MaxUint256);
        await tx.wait();
    }

    private async _getSlippageBaseAssetAmount(params: OpenPositionParams): Promise<Big> {
        const { asset, direction, margin, leverage, slippagePercent } = params;
        if (!slippagePercent) {
            return toBig(0);
        }
        const collectionInstance = this._getCollectionInstance(asset);
        const side = this._getSide(direction);
        const baseAssetOut = await collectionInstance.getInputPrice(
            side,
            toDecimal(toWei(toBig(margin).mul(leverage)))
        );
        const slippageFraction = Big(slippagePercent).div(100);
        if (side === Side.BUY) {
            return fromDecimal(baseAssetOut).mul(toBig(1).sub(slippageFraction)).round(0, 0);
        }
        return fromDecimal(baseAssetOut).mul(toBig(1).add(slippageFraction)).round(0, 1);
    }

    private _getCollectionInstance(asset: Asset): Amm {
        return new Contract(getAssetAddress(asset), abis.ammAbi, this._wallet) as Amm;
    }

    private async _getBalance(): Promise<Big> {
        return toBig(await this._weth.balanceOf(this._wallet.address));
    }

    private async _checkBalance(amount: Big): Promise<void> {
        const balance = await this._getBalance();
        if (balance.lt(amount)) {
            _throw(`insufficient balance, required: ${format(fromWei(amount))}`);
        }
    }

    private async _checkAllowance(amount: Big): Promise<void> {
        const allowance = await this._getAllowance();
        if (allowance.lt(amount)) {
            await this._maxApprove();
        }
    }

    private async _openPosition(
        ammAddress: string,
        side: Side,
        margin: Decimal,
        leverage: Decimal,
        slippage: Decimal
    ): Promise<string> {
        const tx = await this._ch.openPosition(ammAddress, side, margin, leverage, slippage, false);
        await tx.wait();
        return tx.hash;
    }

    private _getSide(direction: Direction): Side {
        return direction === "long" ? Side.BUY : Side.SELL;
    }
}
