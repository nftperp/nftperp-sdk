import axios, { AxiosHeaders } from "axios";
import { config } from "../config";
import {
    AmmInfoResponse,
    FundingInfoResponse,
    IndexPriceResponse,
    MarkPriceResponse,
    PositionResponse,
    ReserveResponse,
    Stats24hResponse,
    TransactionSummaryResponse,
    Side,
    ClosePosTxSummaryResponse,
    MarginChangeSummaryResponse,
    TotalPositionSizeResponse,
    BalancesResponse,
    Amm,
    CalcFeeResponse,
    MarkPriceTwapIntervalResponse,
    MarkPriceTwapResponse,
    Instance,
    RateLimitHeaders,
    AmmInfosResponse,
} from "../types";

class RateLimitError extends Error {
    public readonly ratelimit: number;
    public readonly ratelimitRemaining: number;
    public readonly ratelimitReset: number;
    public readonly retryAfter: number;

    constructor(message: string, rlHeaders: RateLimitHeaders) {
        super(message);
        this.ratelimit = rlHeaders.ratelimit;
        this.ratelimitRemaining = rlHeaders.ratelimitRemaining;
        this.ratelimitReset = rlHeaders.ratelimitReset;
        this.retryAfter = rlHeaders.retryAfter;
    }
}

class NftperpApis {
    private readonly _baseUrl;

    constructor(instance: Instance) {
        this._baseUrl = config[instance].apiBaseUrl.replace(/$\//, ""); // trim trailing slash
    }

    public readonly markPrice = async (amm: Amm): Promise<string> => {
        try {
            const url = `${this._baseUrl}/${amm}/markprice`;
            const { data } = await axios.get<{ data: MarkPriceResponse }>(url);
            return data.data.markPrice;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly indexPrice = async (amm: Amm): Promise<string> => {
        try {
            const url = `${this._baseUrl}/${amm}/indexPrice`;
            const { data } = await axios.get<{ data: IndexPriceResponse }>(url);
            return data.data.indexPrice;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly position = async (amm: Amm, trader: string): Promise<PositionResponse> => {
        try {
            const url = `${this._baseUrl}/${amm}/position?trader=${trader}`;
            const { data } = await axios.get<{ data: PositionResponse }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly positions = async (
        trader: string
    ): Promise<{ [key in Amm]: PositionResponse }> => {
        try {
            const url = `${this._baseUrl}/positions?trader=${trader}`;
            const { data } = await axios.get<{ data: { [key in Amm]: PositionResponse } }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly reserves = async (amm: Amm): Promise<ReserveResponse> => {
        try {
            const url = `${this._baseUrl}/${amm}/reserves`;
            const { data } = await axios.get<{ data: ReserveResponse }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly ammInfo = async (amm: Amm): Promise<AmmInfoResponse> => {
        try {
            const url = `${this._baseUrl}/${amm}`;
            const { data } = await axios.get<{ data: AmmInfoResponse }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly ammInfos = async (): Promise<AmmInfosResponse> => {
        try {
            const url = `${this._baseUrl}/amms`;
            const { data } = await axios.get<{ data: AmmInfosResponse }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly transactionSummary = async (
        amm: Amm,
        params: {
            trader: string;
            amount: number;
            leverage: number;
            side: Side;
        }
    ): Promise<TransactionSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/${amm}/transactionsummary`;
            const { data } = await axios.get<{ data: TransactionSummaryResponse }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-ensable */
        }
    };

    public readonly calcFee = async (
        amm: Amm,
        params: {
            amount: number;
            leverage: number;
            side: Side;
            open: boolean;
        }
    ): Promise<CalcFeeResponse> => {
        try {
            const url = `${this._baseUrl}/${amm}/calcfee`;
            const { data } = await axios.get<{ data: CalcFeeResponse }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-ensable */
        }
    };

    public readonly closePosTransactionSummary = async (
        amm: Amm,
        params: { trader: string; closePercent: number }
    ): Promise<ClosePosTxSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/${amm}/closepostransactionsummary`;
            const { data } = await axios.get<{ data: ClosePosTxSummaryResponse }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly stats24h = async (amm: Amm): Promise<Stats24hResponse> => {
        try {
            const url = `${this._baseUrl}/${amm}/stats24h`;
            const { data } = await axios.get<{ data: Stats24hResponse }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly fundingInfo = async (amm: Amm): Promise<FundingInfoResponse> => {
        try {
            const url = `${this._baseUrl}/${amm}/fundinginfo`;
            const { data } = await axios.get<{ data: FundingInfoResponse }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly freeCollateral = async (amm: Amm, trader: string): Promise<string> => {
        try {
            const url = `${this._baseUrl}/${amm}/freeCollateral?trader=${trader}`;
            const { data } = await axios.get<{ data: string }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly marginChangeSummary = async (
        amm: Amm,
        params: {
            trader: string;
            newMargin: string;
        }
    ): Promise<MarginChangeSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/${amm}/marginchangesummary`;
            const { data } = await axios.get<{ data: MarginChangeSummaryResponse }>(url, {
                params,
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly totalPositionSize = async (amm: Amm): Promise<TotalPositionSizeResponse> => {
        try {
            const url = `${this._baseUrl}/${amm}/totalpositionsize`;
            const { data } = await axios.get<{ data: TotalPositionSizeResponse }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly balances = async (trader: string): Promise<BalancesResponse> => {
        try {
            const url = `${this._baseUrl}/balances?trader=${trader}`;
            const { data } = await axios.get<{ data: BalancesResponse }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly ethPrice = async (): Promise<string> => {
        try {
            const url = `${this._baseUrl}/ethPrice`;
            const { data } = await axios.get<{ data: string }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly markPriceTwap = async (amm: Amm): Promise<string> => {
        try {
            const url = `${this._baseUrl}/${amm}/markpricetwap`;
            const { data } = await axios.get<MarkPriceTwapResponse>(url);
            return data.markPriceTwap;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly markPriceTwapInterval = async (amm: Amm): Promise<string> => {
        try {
            const url = `${this._baseUrl}/${amm}/markpricetwapinterval`;
            const { data } = await axios.get<MarkPriceTwapIntervalResponse>(url);
            return data.markPriceTwapInterval;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    private _checkError(e: any): never {
        /* eslint-disable */
        if (e.response) {
            const res = e.response;
            if (res.status === 429) {
                const rlHeaders = this._extractRateLimitHeaders(res.headers);
                const error = new RateLimitError(
                    `RATE_LIMIT: Too many requests, please try in a while`,
                    rlHeaders
                );
                throw error;
            } else if (res.data && res.data.message) {
                throw new Error(res.data.message);
            }
        }
        throw new Error(e.message);
        /* eslint-enable */
    }

    private _extractRateLimitHeaders(headers: AxiosHeaders): RateLimitHeaders {
        const rateLimitHeaders: RateLimitHeaders = {
            ratelimit: parseInt(headers.get("ratelimit-limit") as string),
            ratelimitRemaining: parseInt(headers.get("ratelimit-remaining") as string),
            ratelimitReset: parseInt(headers.get("ratelimit-reset") as string),
            retryAfter: parseInt(headers.get("retry-after") as string),
        };
        return rateLimitHeaders;
    }
}

export default NftperpApis;
