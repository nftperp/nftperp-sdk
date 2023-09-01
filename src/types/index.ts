export * from "./api";

// declare assets here
export enum Amm {
    BAYC = "bayc",
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
