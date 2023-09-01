import { Amm, Side, Sort } from "./index";

export type MarkPriceResponse = {
    data: string;
    status: string;
};

export type MarkPriceTwapResponse = {
    markPriceTwap: string;
    lastUpdatedTimestamp: string;
};

export type MarkPriceTwapIntervalResponse = {
    markPriceTwapInterval: string;
    lastUpdatedTimestamp: string;
};

export type IndexPriceResponse = {
    data: string;
    status: string;
};

export type PositionResponse = {
    amm: Amm;
    trader: string;
    size: string;
    side?: Side;
    notional?: string;
    margin?: string;
    leverage?: string;
    entryPrice?: string;
    markPrice?: string;
    liquidationPrice?: string;
    unrealizedPnl?: string;
    fundingPayment?: string;
    lastPremiumFraction?: string;
};

export type ReserveResponse = {
    quoteAssetReserve: string;
    baseAssetReserve: string;
    k: string;
    lastUpdatedTimestamp: string;
};

export type AmmInfoResponse = {
    markPrice: string;
    indexPrice: string;
    fundingRate: string;
    feeRatio: string;
    initMarginRatio: string;
    maintenanceMarginRatio: string;
    netPositionSize: string;
    positionSizeLong: string;
    positionSizeShort: string;
    openInterestNotional: string;
    volume24h: string;
    markPrice24h: string;
    indexPrice24h: string;
};

export type AmmInfosResponse = {
    [key in Amm]: AmmInfoResponse;
};

export type TransactionSummaryResponse = {
    outputSize: string;
    entryPrice: string;
    priceImpact: string;
    fee: string;
    feeRatio: string;
    totalCost: string;
    liquidationPrice: string;
    surgeFee: boolean;
    loweredFee: boolean;
};

export type Stats24hResponse = {
    markPrice24h: string;
    indexPrice24h: string;
    volume24h: string;
};

export type CloseMarketSummaryResponse = {
    outputMargin: string;
    outputNotional: string;
    exitPrice: string;
    priceImpact: string;
    unrealizedPnl: string;
    fee: string;
};

export type MarginChangeSummaryResponse = {
    newMargin: number;
    liquidationPrice: string;
};

export type TotalPositionSizeResponse = {
    netPositionSize: string;
    positionSizeLong: string;
    positionSizeShort: string;
};

export type BalancesResponse = {
    eth: string;
    weth: string;
};

export interface TxInfo {
    transactionHash: string;
    blockNumber: number;
    transactionIndex: number;
    logIndex: number;
    timestamp: number;
}

export interface MarketTrade extends TxInfo {
    amm: string;
    ammName: string;
    trader: string;
    margin: string;
    size: string;
    exchangedQuote: string;
    exchangedBase: string;
    realizedPnl: string;
    fundingPayment: string;
    markPrice: string;
    liquidationPenalty: string;
    ifFee: string;
    ammFee: string;
    limitFee: string;
    keeperFee: string;
}

export interface ProcessedPositionChangedEvent extends TxInfo {
    trader: string;
    amm: string;
    ammName: string;
    margin: string;
    exchangedPositionNotional: string;
    exchangedPositionSize: string;
    fee: string;
    positionSizeAfter: string;
    realizedPnl: string;
    unrealizedPnlAfter: string;
    badDebt: string;
    liquidationPenalty: string;
    markPrice: string;
    fundingPayment: string;
}

export interface ProcessedFundingPaymentEvent extends TxInfo {
    amm: string;
    ammName: string;
    markPrice: string;
    indexPrice: string;
    premiumFraction: string;
    fundingRate: string;
    insuranceFundPnl: string;
}

export interface ProcessedMarginChangedEvent extends TxInfo {
    trader: string;
    amm: string;
    ammName: string;
    amount: string;
    fundingPayment: string;
}

export type TradeApiParams = {
    amm?: Amm;
    trader?: string;
    from?: number;
    to?: number;
    sort?: Sort;
    page?: number;
    pageSize?: number;
};

export type FundingApiParams = {
    amm?: Amm;
    hash?: string;
    from?: number;
    to?: number;
    sort?: Sort;
    page?: number;
    pageSize?: number;
};

export interface StatsApiResponse<T> {
    page: number;
    pageSize: number;
    result: T[];
}

export type TeamInfoResponse = {
    [key: string]: "almond" | "peanut";
};

export type RateLimitHeaders = {
    ratelimit: number;
    ratelimitRemaining: number;
    ratelimitReset: number;
    retryAfter: number;
};
