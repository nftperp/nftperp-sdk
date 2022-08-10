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

export interface PartialCloseParams {
    asset: Asset;
    partialClosePercent: number;
    slippagePercent?: number;
}

export interface AddMarginParams {
    asset: Asset;
    marginToAdd: number;
}

export interface RemoveMarginParams {
    asset: Asset;
    marginToRemove: number;
}

export interface GetPositionParams {
    asset: Asset;
    trader?: string;
}

export interface GetMarginRatioParams {
    asset: Asset;
    trader?: string;
}

export interface Position {
    size: Big;
    margin: Big;
    openNotional: Big;
}

export interface Ratios {
    imr: Big;
    mmr: Big;
    plr: Big;
    lfr: Big;
}

export interface PositionDisplay {
    size: number;
    margin: number;
    leverage: number;
    pnl: number;
    funding: number;
    entryPrice: number;
    liquidationPrice: number;
}

export interface Reserves {
    quoteAssetReserve: Big;
    baseAssetReserve: Big;
}
