import axios, { AxiosHeaders } from "axios";
import { config } from "../config";
import {
    AmmInfoResponse,
    IndexPriceResponse,
    MarkPriceResponse,
    PositionResponse,
    TransactionSummaryResponse as OpenSummaryResponse,
    Side,
    CloseMarketSummaryResponse,
    MarginChangeSummaryResponse,
    BalancesResponse,
    Amm,
    Instance,
    RateLimitHeaders,
    AmmInfosResponse,
    TradeApiParams,
    StatsApiResponse,
    FundingApiParams,
    ProcessedFundingPaymentEvent,
    MarketTrade,
    MakerPositionResponse,
    Order,
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
            const url = `${this._baseUrl}/markPrice`;
            const { data } = await axios.get<MarkPriceResponse>(url, {
                params: { amm },
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly indexPrice = async (amm: Amm): Promise<string> => {
        try {
            const url = `${this._baseUrl}/indexPrice`;
            const { data } = await axios.get<IndexPriceResponse>(url, {
                params: { amm },
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly position = async (amm: Amm, trader: string): Promise<PositionResponse> => {
        try {
            const url = `${this._baseUrl}/position`;
            const { data } = await axios.get<{ data: PositionResponse }>(url, {
                params: { amm, trader },
            });
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
            const url = `${this._baseUrl}/positions`;
            const { data } = await axios.get<{ data: { [key in Amm]: PositionResponse } }>(url, {
                params: { trader },
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly makerPosition = async (
        amm: Amm,
        trader: string
    ): Promise<MakerPositionResponse> => {
        try {
            const url = `${this._baseUrl}/position/maker`;
            const { data } = await axios.get<{ data: MakerPositionResponse }>(url, {
                params: { amm, trader },
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly makerPositions = async (
        trader: string
    ): Promise<{ [key in Amm]: MakerPositionResponse }> => {
        try {
            const url = `${this._baseUrl}/positions/maker`;
            const { data } = await axios.get<{ data: { [key in Amm]: MakerPositionResponse } }>(
                url,
                {
                    params: { trader },
                }
            );
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly ammInfo = async (amm: Amm): Promise<AmmInfoResponse> => {
        try {
            const url = `${this._baseUrl}/info`;
            const { data } = await axios.get<{ data: AmmInfoResponse }>(url, {
                params: { amm },
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly ammInfos = async (): Promise<AmmInfosResponse> => {
        try {
            const url = `${this._baseUrl}/infos`;
            const { data } = await axios.get<{ data: AmmInfosResponse }>(url);
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly openSummary = async (params: {
        amm: Amm;
        margin: number;
        leverage: number;
        side: Side;
    }): Promise<OpenSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/openSummary`;
            const { data } = await axios.get<{ data: OpenSummaryResponse }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-ensable */
        }
    };

    public readonly closeMarketSummary = async (params: {
        amm: Amm;
        trader: string;
        closePercent: number;
    }): Promise<CloseMarketSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/closeMarketSummary`;
            const { data } = await axios.get<{ data: CloseMarketSummaryResponse }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly closeLimitSummary = async (params: {
        amm: Amm;
        trader: string;
        trigger: number;
        closePercent: number;
    }): Promise<CloseMarketSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/closeLimitSummary`;
            const { data } = await axios.get<{ data: CloseMarketSummaryResponse }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly fundingRate = async (amm: Amm): Promise<string> => {
        try {
            const url = `${this._baseUrl}/fundingRate`;
            const { data } = await axios.get<{ data: string }>(url, { params: { amm } });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly freeCollateral = async (amm: Amm, trader: string): Promise<string> => {
        try {
            const url = `${this._baseUrl}/freeCollateral`;
            const { data } = await axios.get<{ data: string }>(url, { params: { amm, trader } });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly marginChangeSummary = async (params: {
        amm: Amm;
        trader: string;
        margin: string;
    }): Promise<MarginChangeSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/marginChangeSummary`;
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

    public readonly balances = async (trader: string): Promise<BalancesResponse> => {
        try {
            const url = `${this._baseUrl}/balances`;
            const { data } = await axios.get<{ data: BalancesResponse }>(url, {
                params: { trader },
            });
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

    public readonly marketTrades = async (
        params?: TradeApiParams
    ): Promise<StatsApiResponse<MarketTrade>> => {
        try {
            const url = `${this._baseUrl}/marketTrades`;
            const { data } = await axios.get<{
                data: StatsApiResponse<MarketTrade>;
            }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly fundings = async (
        params?: FundingApiParams
    ): Promise<StatsApiResponse<ProcessedFundingPaymentEvent>> => {
        try {
            const url = `${this._baseUrl}/fundings`;
            const { data } = await axios.get<{
                data: StatsApiResponse<ProcessedFundingPaymentEvent>;
            }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly orders = async (params: { amm: Amm; trader: string }): Promise<Order[]> => {
        try {
            const url = `${this._baseUrl}/orders`;
            const { data } = await axios.get<{
                data: Order[];
            }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly triggerOrders = async (params: {
        amm: Amm;
        trader: string;
    }): Promise<Order[]> => {
        try {
            const url = `${this._baseUrl}/orders/trigger`;
            const { data } = await axios.get<{
                data: Order[];
            }>(url, { params });
            return data.data;
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
