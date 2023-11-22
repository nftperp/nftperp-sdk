import { Config } from "../types";

export const config: Config = {
    PAPER_TRADING: {
        apiBaseUrl: "https://api.nftperp.xyz",
        apiWsUrl: "https://api.nftperp.xyz",
        chainId: 42161,
        ch: "0xe71aD99B466422Fe291a5756f1B7542f6b55eA48",
        iF: "0xbf760CB08D505D0184fB47E47bc3E46800aAeED5",
        weth: "0x1C61B0D3e925BEE058b82876C5c9eb65ea71D145",
        amms: {
            bayc: "0x9a5F2f362C9E74C689240015Ff21511DcDB953B5",
            milady: "0x35884dEBc48B63E173676CACe93cE2eBA979C598",
            ppg: "0xb57199211Ecf0505062e01f102E4b9c03925E2b7",
            cdb: "0x4f02d378506B8Fa226DF6A85112B41fae6b632a6",
            cap: "0x14444c1ED5dCFC7275F757ABd33e1d651c908FED",
        },
    },
};
