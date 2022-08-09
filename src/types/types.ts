import { BigNumber } from "ethers";
import { ASSETS } from "../config/addresses";

export type Direction = "long" | "short";

export enum Side {
    BUY,
    SELL,
}

export type Asset = typeof ASSETS[number];

export interface AddressConfig {
    ch: string;
    chv: string;
    iF: string;
    weth: string;
    assets: {
        [key in Asset]: string;
    };
}

export type Decimal = { d: string | BigNumber };

/**
 * @param asset the asset to trade eg. bayc
 * @param direction long or short
 * @param margin collateral amount
 * @param leverage leverage
 * @param slippagePercent slippage percent
 */
export interface OpenPositionParams {
    asset: Asset;
    direction: Direction;
    margin: number;
    leverage: number;
    slippagePercent?: number;
}
