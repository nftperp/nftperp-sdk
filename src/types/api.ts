import { Amm, Side } from "./index";

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

export type TeamInfoResponse = {
    [key: string]: "almond" | "peanut";
};
