import { Config } from "../types";

export const config: Config = {
    PAPER_TRADING: {
        apiBaseUrl: "https://api.nftperp.xyz",
        apiWsUrl: "https://api.nftperp.xyz",
        chainId: 42161,
        ch: "0x050DFE7dB01f744a4ADa88Ea6941ac988732cBE3",
        iF: "0x4bC7Fb79aa23e02f7Bf12Bb07b05B1f923f98B45",
        weth: "0xf634C6B09BB8fC050b259BcB44558b2692c49999",
        amms: {
            bayc: "0x91F22418ac361E400D26ac9B570Ed0342808f4B6",
            milady: "0x09CF2d081831CFF39e85203b06F99a9dd2952497",
            ppg: "0xbE1198da05AbbD0969D16d4c971432e155b9C138",
            cdb: "0x4539A4B39C1DC2b02eaeD6f28cea5b1b0D07Fd86",
        },
    },
};
