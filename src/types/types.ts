import Big from "big.js";
import { BigNumber } from "ethers";
import { ASSETS } from "../config/addresses";

export type Direction = "long" | "short";

export enum Side {
    BUY,
    SELL,
}

export enum DirectionOfAsset {
    ADD_TO_AMM,
    REMOVE_FROM_AMM,
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

export interface OpenPositionParams {
    asset: Asset;
    direction: Direction;
    margin: number;
    leverage: number;
    slippagePercent?: number;
}

export interface ClosePositionParams {
    asset: Asset;
    slippagePercent?: number;
}

/**
 *
 */
export interface Position {
    size: Big;
    margin: Big;
    openNotional: Big;
}
