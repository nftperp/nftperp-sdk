import { describe, expect, it, jest } from "@jest/globals";
import axios from "axios";
import Api from "./api"; // Adjust the import path accordingly
import { Amm, Instance, Side } from "../types";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const trader = "0x9510a5cBDe44227C00cf36FF5D2f8B6b72DDCd55";
const amm = Amm.BAYC;
const instance = new Api(Instance.TRADING_COMP);

describe("NftperpApis", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should fetch mark price", async () => {
        const mockMarkPriceResponse = {
            data: "123.45",
        };
        mockedAxios.get.mockResolvedValue({ data: mockMarkPriceResponse });

        const result = await instance.markPrice(amm);

        expect(result).toBe("123.45");
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/markPrice"), {
            params: { amm },
        });
    });

    it("should fetch index price", async () => {
        const mockIndexPriceResponse = {
            data: "123.45",
        };
        mockedAxios.get.mockResolvedValue({ data: mockIndexPriceResponse });

        const result = await instance.indexPrice(amm);

        expect(result).toBe("123.45");
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/indexPrice"), {
            params: { amm },
        });
    });

    it("should fetch position", async () => {
        const mockPositionResponse = {
            amm: Amm.BAYC,
            trader,
            size: "123.45",
            side: "buy",
            notional: "123.45",
            margin: "123.45",
            leverage: "123.45",
            entryPrice: "123.45",
            markPrice: "123.45",
            liquidationPrice: "123.45",
            unrealizedPnl: "123.45",
            fundingPayment: "123.45",
            lastPremiumFraction: "123.45",
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockPositionResponse } });

        const result = await instance.position(amm, trader);

        expect(result).toStrictEqual(mockPositionResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/position"), {
            params: { amm, trader },
        });
    });

    it("should fetch positions", async () => {
        const mockPositionsResponse = {
            bayc: {
                amm: Amm.BAYC,
                trader,
                size: "123.45",
                side: "buy",
                notional: "123.45",
                margin: "123.45",
                leverage: "123.45",
                entryPrice: "123.45",
                markPrice: "123.45",
                liquidationPrice: "123.45",
                unrealizedPnl: "123.45",
                fundingPayment: "123.45",
                lastPremiumFraction: "123.45",
            },
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockPositionsResponse } });

        const result = await instance.positions(trader);

        expect(result).toStrictEqual(mockPositionsResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/positions"), {
            params: { trader },
        });
    });

    it("should fetch amm info", async () => {
        const mockAmmInfoResponse = {
            markPrice: "123.45",
            indexPrice: "123.45",
            fundingRate: "123.45",
            feeRatio: "123.45",
            initMarginRatio: "123.45",
            maintenanceMarginRatio: "123.45",
            netPositionSize: "123.45",
            positionSizeLong: "123.45",
            positionSizeShort: "123.45",
            openInterestNotional: "123.45",
            volume24h: "123.45",
            markPrice24h: "123.45",
            indexPrice24h: "123.45",
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockAmmInfoResponse } });

        const result = await instance.ammInfo(amm);

        expect(result).toStrictEqual(mockAmmInfoResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/info"), {
            params: { amm },
        });
    });

    it("should fetch amm infos", async () => {
        const mockAmmInfosResponse = {
            bayc: {
                markPrice: "123.45",
                indexPrice: "123.45",
                fundingRate: "123.45",
                feeRatio: "123.45",
                initMarginRatio: "123.45",
                maintenanceMarginRatio: "123.45",
                netPositionSize: "123.45",
                positionSizeLong: "123.45",
                positionSizeShort: "123.45",
                openInterestNotional: "123.45",
                volume24h: "123.45",
                markPrice24h: "123.45",
                indexPrice24h: "123.45",
            },
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockAmmInfosResponse } });

        const result = await instance.ammInfos();

        expect(result).toStrictEqual(mockAmmInfosResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/infos"));
    });

    it("should fetch open transaction summary", async () => {
        const mockOpenTransactionSummaryResponse = {
            outputSize: "0.06436425324327194192",
            entryPrice: "31.19999999999999999999",
            priceImpact: "0.912974058869770293",
            fee: "0.006",
            feeRatio: "0.003",
            totalCost: "1.006",
            liquidationPrice: "17.549999999999999999994375",
            surgeFee: false,
            loweredFee: false,
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockOpenTransactionSummaryResponse } });

        const params = {
            amm,
            margin: 1,
            side: Side.BUY,
            leverage: 2,
        };
        const result = await instance.openSummary(params);

        expect(result).toStrictEqual(mockOpenTransactionSummaryResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/openSummary"), {
            params,
        });
    });

    it("should fetch close market summary", async () => {
        const mockCloseMarketSummaryResponse = {
            outputMargin: "2",
            outputNotional: "10.01702142435501232141",
            exitPrice: "30.05210774902854491841",
            priceImpact: "8.514480041396489671",
            unrealizedPnl: "-0.01702142435501232141",
            fee: "0.03005106427306503696423",
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockCloseMarketSummaryResponse } });

        const params = {
            amm,
            trader,
            closePercent: 100,
        };
        const result = await instance.closeMarketSummary(params);

        expect(result).toStrictEqual(mockCloseMarketSummaryResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/closeMarketSummary"), {
            params,
        });
    });

    it("should fetch close limit summary", async () => {
        const mockCloseLimitSummaryResponse = {
            outputMargin: "2",
            outputNotional: "34.7222222222222222",
            exitPrice: "100",
            priceImpact: "0",
            unrealizedPnl: "-24.7222222222222222",
            fee: "0.0520833333333333333",
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockCloseLimitSummaryResponse } });

        const params = {
            amm,
            trader,
            closePercent: 100,
            trigger: 100,
        };
        const result = await instance.closeLimitSummary(params);

        expect(result).toStrictEqual(mockCloseLimitSummaryResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/closeLimitSummary"), {
            params,
        });
    });

    it("should fetch funding rate", async () => {
        const mockFundingRateResponse = {
            data: "0.789830215444155583",
        };
        mockedAxios.get.mockResolvedValue({ data: mockFundingRateResponse });

        const result = await instance.fundingRate(amm);

        expect(result).toBe("0.789830215444155583");
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/fundingRate"), {
            params: { amm },
        });
    });

    it("should fetch free collateral", async () => {
        const mockFreeCollateralResponse = {
            data: "123.45",
        };
        mockedAxios.get.mockResolvedValue({ data: mockFreeCollateralResponse });

        const result = await instance.freeCollateral(amm, trader);

        expect(result).toBe("123.45");
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/freeCollateral"), {
            params: { amm, trader },
        });
    });

    it("should fetch margin change summary", async () => {
        const mockMarginChangeSummaryResponse = {
            newMargin: 1.5,
            liquidationPrice: "31.320000000000000020042625",
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockMarginChangeSummaryResponse } });

        const params = {
            amm,
            trader,
            margin: "1.5",
        };
        const result = await instance.marginChangeSummary(params);

        expect(result).toStrictEqual(mockMarginChangeSummaryResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/marginChangeSummary"), {
            params,
        });
    });

    it("should fetch balances", async () => {
        const mockBalancesResponse = {
            data: {
                eth: "123.45",
                weth: "123.45",
            },
        };
        mockedAxios.get.mockResolvedValue({ data: mockBalancesResponse });

        const result = await instance.balances(trader);

        expect(result).toStrictEqual(mockBalancesResponse.data);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/balances"), {
            params: { trader },
        });
    });

    it("should fetch eth price", async () => {
        const mockEthPriceResponse = {
            data: "123.45",
        };
        mockedAxios.get.mockResolvedValue({ data: mockEthPriceResponse });

        const result = await instance.ethPrice();

        expect(result).toBe("123.45");
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/ethPrice"));
    });

    it("should fetch maker position", async () => {
        const mockMakerPositionResponse = {
            amm: "bayc",
            trader: "0x9510a5cBDe44227C00cf36FF5D2f8B6b72DDCd55",
            liquidity: "0",
            quoteReserve: "2.5",
            baseReserve: "0.094071076342441284",
            return30d: "0",
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockMakerPositionResponse } });

        const result = await instance.makerPosition(amm, trader);

        expect(result).toStrictEqual(mockMakerPositionResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/position/maker"), {
            params: { amm, trader },
        });
    });

    it("should fetch maker positions", async () => {
        const mockMakerPositionsResponse = {
            bayc: {
                amm: "bayc",
                trader: "0x9510a5cBDe44227C00cf36FF5D2f8B6b72DDCd55",
                liquidity: "0",
                quoteReserve: "0",
                baseReserve: "0",
                return30d: "0",
            },
            milady: {
                amm: "milady",
                trader: "0x9510a5cBDe44227C00cf36FF5D2f8B6b72DDCd55",
                liquidity: "0",
                quoteReserve: "0",
                baseReserve: "0",
                return30d: "0",
            },
            ppg: {
                amm: "ppg",
                trader: "0x9510a5cBDe44227C00cf36FF5D2f8B6b72DDCd55",
                liquidity: "0",
                quoteReserve: "0",
                baseReserve: "0",
                return30d: "0",
            },
            cdb: {
                amm: "cdb",
                trader: "0x9510a5cBDe44227C00cf36FF5D2f8B6b72DDCd55",
                liquidity: "0",
                quoteReserve: "0",
                baseReserve: "0",
                return30d: "0",
            },
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockMakerPositionsResponse } });

        const result = await instance.makerPositions(trader);

        expect(result).toStrictEqual(mockMakerPositionsResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/positions/maker"), {
            params: { trader },
        });
    });

    it("should fetch orderbook", async () => {
        const mockOrderbookResponse = {
            amm: "bayc",
            markPrice: 26.26098425835745,
            asks: 1.1668797863197071,
            bids: 20.180250609760755,
            levels: [
                {
                    price: 28.85,
                    size: 0.020797227036395145,
                    side: 1,
                },
                {
                    price: 28.57,
                    size: 0.04935246762338116,
                    side: 1,
                },
                {
                    price: 28.3,
                    size: 0.11837455830388692,
                    side: 1,
                },
                {
                    price: 28.02,
                    size: 0.2844396859386153,
                    side: 1,
                },
                {
                    price: 27.75,
                    size: 0.683963963963964,
                    side: 1,
                },
                {
                    price: 27.38,
                    size: 0.009951883453464629,
                    side: 1,
                },
                {
                    price: 26,
                    size: 0.1449519286125778,
                    side: 0,
                },
                {
                    price: 25.78,
                    size: 0.03529868114817688,
                    side: 0,
                },
                {
                    price: 0.01,
                    size: 20,
                    side: 0,
                },
            ],
        };
        mockedAxios.get.mockResolvedValue({ data: { data: mockOrderbookResponse } });
        const result = await instance.orderbook({ amm: Amm.BAYC });

        expect(result).toStrictEqual(mockOrderbookResponse);
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/orderbook"), {
            params: { amm },
        });
    });
});
