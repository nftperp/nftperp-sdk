import axios from "axios";
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
    TeamInfoResponse,
    Amm,
    CalcFeeResponse,
    MarkPriceTwapIntervalResponse,
    MarkPriceTwapResponse,
    Instance,
} from "../types";

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
            throw new Error(`error occured in mark price api: ${e.message}`);
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
            throw new Error(`error occured in index price api: ${e.message}`);
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
            throw new Error(`error occured in position api: ${e.message}`);
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
            throw new Error(`error occured in position api: ${e.message}`);
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
            throw new Error(`error occured in reserves api: ${e.message}`);
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
            throw new Error(`error occured in amm info api: ${e.message}`);
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
            throw new Error(`error occured in transaction summmary api: ${e.message}`);
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
            throw new Error(`error occured in calc fee api: ${e.message}`);
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
            throw new Error(`error occured in close pos transaction summmary api: ${e.message}`);
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
            throw new Error(`error occured in stats 24h api: ${e.message}`);
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
            throw new Error(`error occured in funding info api: ${e.message}`);
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
            throw new Error(`error occured in free collateral api: ${e.message}`);
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
            throw new Error(`error occured in margin change summary api: ${e.message}`);
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
            throw new Error(`error occured in total position size api: ${e.message}`);
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
            throw new Error(`error occured in balances api: ${e.message}`);
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
            throw new Error(`error occured in balances api: ${e.message}`);
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
            throw new Error(`error occured in mark price twap api: ${e.message}`);
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
            throw new Error(`error occured in mark price twap interval api: ${e.message}`);
            /* eslint-enable */
        }
    };
}

export default NftperpApis;
