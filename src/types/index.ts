import Big from "big.js";
import { BigNumber } from "ethers";

// declare assets here
export enum Amm {
    BAYC = "BAYC",
    MOONBIRDS = "MOONBIRDS",
    MAYC = "MAYC",
    DOODLES = "DOODLES",
    CLONEX = "CLONEX",
}

export enum Side {
    BUY, // long
    SELL, // short
}

export enum DirectionOfAsset {
    ADD_TO_AMM,
    REMOVE_FROM_AMM,
}

export enum Instance {
    BETA = "BETA",
    HACKATHON = "HACKATHON",
}

export type InstanceConfig = {
    chainId: number;
    ch: string;
    chv: string;
    iF: string;
    weth: string;
    amms: {
        [key in Amm]?: string;
    };
};

export type Config = {
    [key in Instance]: InstanceConfig;
};

export type Decimal = { d: string | BigNumber };

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
    entryPrice: number | null;
    liquidationPrice: number | null;
}

export interface Reserves {
    quoteAssetReserve: Big;
    baseAssetReserve: Big;
}

export interface OpenInterestInfo {
    openInterest: Big;
    openInterestLongs: Big;
    openInterestShorts: Big;
}

export interface AmmInfo {
    amm: Amm;
    markPrice: number;
    indexPrice: number;
    maxLeverage: number;
    maintenanceMarginPercent: number;
    fullLiquidationPercent: number;
    previousFundingPercent: number;
    nextFundingTime: number;
    openInterest: number;
    openInterestLongs: number;
    openInterestShorts: number;
}
