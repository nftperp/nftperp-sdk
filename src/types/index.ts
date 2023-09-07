export * from "./api";

// declare assets here
export enum Amm {
    BAYC = "bayc",
    MILADY = "milady",
    PPG = "ppg",
    CDB = "cdb",
}

export enum Side {
    BUY = "buy", // long
    SELL = "sell", // short
}

export enum Instance {
    TRADING_COMP = "TRADING_COMP",
}

export enum Sort {
    ASC = "1",
    DESC = "-1",
}

export enum EVENT {
    TRADE = "TRADE",
    FUNDING = "FUNDING",
}

export type InstanceConfig = {
    apiBaseUrl: string;
    apiWsUrl: string;
    chainId: number;
    ch: string;
    iF: string;
    weth: string;
    amms: {
        [key in Amm]?: string;
    };
};

export type Config = {
    [key in Instance]: InstanceConfig;
};

export type Order = {
    id: string;
    amm: Amm;
    trader: string;
    price: number;
    size: number;
    side: number;
    timestamp: number;
};

export type Level = {
    price: number;
    size: number;
    side: number;
};

export type OrderBook = {
    asks: number;
    bids: number;
    levels: Level[];
    amm: "bayc";
    markPrice: number;
};
