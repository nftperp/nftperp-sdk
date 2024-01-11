export * from "./api";
export * from "../typechain-types";

// declare assets here
export enum Amm {
    BAYC = "bayc",
    MILADY = "milady",
    PPG = "ppg",
    CDB = "cdb",
    CAP = "cap",
    SPROTO = "sproto",
    SOFA = "sofa",
    DEGODS = "degods",
}

export enum Side {
    BUY = "buy", // long
    SELL = "sell", // short
}

export enum Sort {
    ASC = "asc",
    DESC = "desc",
}

export enum EVENT {
    TRADE = "TRADE",
    FUNDING = "FUNDING",
}

export enum TriggerType {
    STOP_LOSS = "STOP_LOSS",
    TAKE_PROFIT = "TAKE_PROFIT",
}

export type Config = {
    apiBaseUrl: string;
    apiWsUrl: string;
    chainId: number;
    contracts: {
        ch: string;
        iF: string;
        weth: string;
        amms: {
            [key in Amm]: string;
        };
    };
};

export type Order = {
    id: number;
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
    amm: Lowercase<Amm>;
    markPrice: number;
};
