export * from "./api";
export * from "../typechain-types";

// declare assets here
export enum Amm {
    MILADY = "milady",
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
    rpcUrl: string;
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

export type LimitOrder = {
    id: number;
    amm: Amm;
    trader: string;
    price: string;
    size: string;
    side: string;
    timestamp: number;
    margin: string;
    reduceOnly: boolean;
};

export type TriggerOrder = {
    id: number;
    takeProfit: boolean;
    side: number;
    amm: Amm;
    trader: string;
    trigger: string;
    size: string;
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
