import { Config } from "../types";

const config: Config = {
    apiBaseUrl: "https://api2.nftperp.xyz",
    apiWsUrl: "wss://api2.nftperp.xyz",
    rpcUrl: "https://arbitrum.llamarpc.com",
    chainId: 42161,
    contracts: {
        ch: "0x9e8B6D29C0410B8c7E67bB151CA7C0f9F6cBa8bF",
        iF: "0x087E8C29d0743120A9b9d003F702FB7F450291ba",
        weth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        amms: {
            milady: "0x66945724757a91199AB0B0c77EcBB90abA897F75",
        },
    },
};

export default config;
