import { Config } from "../types";

export const config: Config = {
    PAPER_TRADING: {
        apiBaseUrl: "https://api.nftperp.xyz",
        apiWsUrl: "https://api.nftperp.xyz",
        chainId: 42161,
        ch: "0x8f940C5A2be8ee72487CB5E257a6DE54DBbfD9DD",
        iF: "0xe70Ad23d0171de72c9015212359A1Fe1Cd30Ff35",
        weth: "0x9A3111B39f67784f312109783A3422Bd39D34424",
        amms: {
            bayc: "0xc7cA02aa95EBcCeBC098A4C0a07de0CDa110036b",
            milady: "0x3eD0F8F0226585a1b66469A903d4eD5f27346f9C",
            ppg: "0x30cA2c67aA824607d4165E03b9C5295bCa5F1f46",
            cdb: "0x4564514B934004fCE5e9F0713E17D7D3B19B672C",
        },
    },
};
