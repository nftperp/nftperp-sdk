import { BigNumber } from "ethers";
export * from "./api";

// declare assets here
export enum Amm {
    BAYC = "BAYC",
    MILADY = "MILADY",
    PUNKS = "PUNKS",
    AZUKI = "AZUKI",
    MAYC = "MAYC",
    DOODLES = "DOODLES",
    MOONBIRDS = "MOONBIRDS",
    BGAN = "BGAN",
    GOBBLERS = "GOBBLERS",
    PPG = "PPG",
}

export enum Side {
    BUY = "BUY", // long
    SELL = "SELL", // short
}

export enum Instance {
    TRADING_COMP = "TRADING_COMP",
    BETA = "BETA",
}

export type InstanceConfig = {
    apiBaseUrl: string;
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
