import { Overrides } from "ethers";
import { Amm, Side, Sort } from "./index";

export type MarkPriceResponse = {
    markPrice: string;
    lastUpdatedTimestamp: string;
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
    indexPrice: string;
    lastUpdatedTimestamp: string;
};

export type PositionResponse = {
    trader: string;
    ammName: Amm;
    side?: Side;
    size: string;
    entryPrice?: string;
    markPrice?: string;
    margin?: string;
    leverage?: string;
    notional?: string;
    fundingPayment?: string;
    unrealizedPnl?: string;
    liquidationPrice?: string;
    marginRatio?: string;
    blockNumber?: string;
    lastUpdatedTimestamp: string;
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
    feeRatio: string;
    fluctuationLimitRatio: string;
    initMarginRatio: string;
    maintenanceMarginRatio: string;
    liquidationFeeRatio: string;
    quoteAssetReserve: string;
    baseAssetReserve: string;
    openInterestNotionalCap: string;
    maxHoldingCap: string;
    openInterestNotional: string;
    netPositionSize: string;
    positionSizeLong: string;
    positionSizeShort: string;
    fundingPeriod: string;
    nextFundingTime: string;
    previousFundingRateLong: string;
    previousFundingRateShort: string;
    nextEstimatedFundingRateLong: string;
    nextEstimatedFundingRateShort: string;
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

export type CalcFeeResponse = {
    fee: string;
    feeRatio: string;
    surgeFee: boolean;
    loweredFee: boolean;
};

export type Stats24hResponse = {
    markPrice24h: string;
    indexPrice24h: string;
    volume24h: string;
};

export type FundingInfoResponse = {
    fundingPeriod: string;
    nextFundingTime: string;
    previousFundingRateLong: string;
    previousFundingRateShort: string;
    nextEstimatedFundingRateLong: string;
    nextEstimatedFundingRateShort: string;
};

export type ClosePosTxSummaryResponse = {
    outputNotional: string;
    outputMargin: string;
    exitPrice: string;
    priceImpact: string;
    fee: string;
    feeRatio: string;
    pnl: string;
    liquidationPrice: string;
};

export type MarginChangeSummaryResponse = {
    newMargin: string;
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
    premiumFractionLong: string;
    premiumFractionShort: string;
    fundingRateLong: string;
    fundingRateShort: string;
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
    hash?: string;
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
    totalPages: number;
    totalCount: number;
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
