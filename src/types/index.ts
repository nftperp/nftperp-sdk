import * as config from "../config";
export * from "./api";
export * from "../typechain-types";

export type Network = (typeof config.NETWORKS)[number];

// declare assets here
export enum Amm {
    MILADY = "milady",
    PPG = "ppg",
    PPG_BLAST = "ppg_blast",
    MILADY_BLAST = "milady_blast",
    PUNKS_BLAST = "punks_blast",
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
    chainId_blast: number;
    rpcUrl: string;
    rpcUrl_blast: string;
    contracts: {
        clearingHouse: string;
        clearingHouse_blast: string;
        insuranceFund: string;
        insuranceFund_blast: string;
        priceFeed: string;
        priceFeed_blast: string;
        whitelist: string;
        whitelist_blast: string;
        weth: string;
        weth_blast: string;
        degenDraw_blast: string;
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
