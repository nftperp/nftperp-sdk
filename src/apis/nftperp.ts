import axios from "axios";
import * as config from "../config";
import * as types from "../types";

export class NftperpApis {
    private readonly _baseUrl;

    constructor(instance: types.Instance) {
        this._baseUrl = config.config[instance].apiBaseUrl.replace(/$\//, ""); // trim trailing slash
    }

    public readonly markPrice = async (amm: types.Amm): Promise<string> => {
        try {
            const url = `${this._baseUrl}/markPrice`;
            const { data } = await axios.get<types.MarkPriceResponse>(url, {
                params: { amm },
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly indexPrice = async (amm: types.Amm): Promise<string> => {
        try {
            const url = `${this._baseUrl}/indexPrice`;
            const { data } = await axios.get<types.IndexPriceResponse>(url, {
                params: { amm },
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly position = async (amm: types.Amm, trader: string): Promise<types.PositionResponse> => {
        try {
            const url = `${this._baseUrl}/position`;
            const { data } = await axios.get<{ data: types.PositionResponse }>(url, {
                params: { amm, trader },
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly makerPosition = async (amm: types.Amm, trader: string): Promise<types.MakerPositionResponse> => {
        try {
            const url = `${this._baseUrl}/position/maker`;
            const { data } = await axios.get<{ data: types.MakerPositionResponse }>(url, {
                params: { amm, trader },
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly ammInfo = async (amm: types.Amm): Promise<types.AmmInfoResponse> => {
        try {
            const url = `${this._baseUrl}/info`;
            const { data } = await axios.get<{ data: types.AmmInfoResponse }>(url, {
                params: { amm },
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly openSummary = async (params: {
        amm: types.Amm;
        margin: number;
        leverage: number;
        side: types.Side;
    }): Promise<types.OpenSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/openSummary`;
            const { data } = await axios.get<{ data: types.OpenSummaryResponse }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-ensable */
        }
    };

    public readonly closeMarketSummary = async (params: {
        amm: types.Amm;
        trader: string;
        closePercent: number;
    }): Promise<types.CloseSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/closeMarketSummary`;
            const { data } = await axios.get<{ data: types.CloseSummaryResponse }>(url, {
                params,
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly closeLimitSummary = async (params: {
        amm: types.Amm;
        trader: string;
        trigger: number;
        closePercent: number;
    }): Promise<types.CloseSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/closeLimitSummary`;
            const { data } = await axios.get<{ data: types.CloseSummaryResponse }>(url, {
                params,
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly fundingRate = async (amm: types.Amm): Promise<string> => {
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

    public readonly freeCollateral = async (amm: types.Amm, trader: string): Promise<string> => {
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
        amm: types.Amm;
        trader: string;
        margin: string;
    }): Promise<types.MarginChangeSummaryResponse> => {
        try {
            const url = `${this._baseUrl}/marginChangeSummary`;
            const { data } = await axios.get<{ data: types.MarginChangeSummaryResponse }>(url, {
                params,
            });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly balances = async (trader: string): Promise<types.BalancesResponse> => {
        try {
            const url = `${this._baseUrl}/balances`;
            const { data } = await axios.get<{ data: types.BalancesResponse }>(url, {
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
        params?: types.TradeApiParams
    ): Promise<types.StatsApiResponse<types.MarketTrade>> => {
        try {
            const url = `${this._baseUrl}/marketTrades`;
            const { data } = await axios.get<{
                data: types.StatsApiResponse<types.MarketTrade>;
            }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly fundings = async (
        params?: types.FundingApiParams
    ): Promise<types.StatsApiResponse<types.ProcessedFundingPaymentEvent>> => {
        try {
            const url = `${this._baseUrl}/fundings`;
            const { data } = await axios.get<{
                data: types.StatsApiResponse<types.ProcessedFundingPaymentEvent>;
            }>(url, { params });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly orders = async (amm: types.Amm, trader: string): Promise<types.Order[]> => {
        try {
            const url = `${this._baseUrl}/orders`;
            const { data } = await axios.get<{
                data: types.Order[];
            }>(url, { params: { amm, trader } });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly triggerOrders = async (amm: types.Amm, trader: string): Promise<types.Order[]> => {
        try {
            const url = `${this._baseUrl}/orders/trigger`;
            const { data } = await axios.get<{
                data: types.Order[];
            }>(url, { params: { amm, trader } });
            return data.data;
            /* eslint-disable */
        } catch (e: any) {
            this._checkError(e);
            /* eslint-enable */
        }
    };

    public readonly orderbook = async (amm: types.Amm): Promise<types.OrderBook> => {
        try {
            const url = `${this._baseUrl}/orderbook`;
            const { data } = await axios.get<{
                data: types.OrderBook;
            }>(url, { params: { amm } });
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
                throw new Error(`RATE_LIMIT: Too many requests, please try in a while`);
            } else if (res.data && res.data.message) {
                throw new Error(res.data.message);
            }
        }
        throw new Error(e.message);
        /* eslint-enable */
    }
}
