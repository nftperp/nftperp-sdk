import { Config } from "../types";

export const config: Config = {
    TRADING_COMP: {
        apiBaseUrl: "https://api.nftperp.xyz",
        apiWsUrl: "https://api.nftperp.xyz",
        chainId: 42161,
        ch: "0x882B2578C4b8F1AE22eeF8A1692E8A5aF8c725BC",
        iF: "0x7733007Fb8B56435f13c287Babf09696111a9D98",
        weth: "0x4921769431F322099659b8Cf198526E586ae981E",
        amms: {
            bayc: "0x59d691DC3913eE29D9182EF3EdFaa1B07c80a869",
            milady: "0x6c792C96c026d32B0219C983d87C959082c9865c",
            ppg: "0x91eBBfd56a98739280A1349F1Dbf2ea72e8453DC",
            cdb: "0xc8a186248305dC8C3218988E5EB5CeC9BFBcD292",
        },
    },
};
