import { Config } from "../types";

export const NETWORKS = ["arb", "blast"] as const;

export const info: Config = {
    apiBaseUrl: "https://live.nftperp.xyz",
    apiWsUrl: "wss://live.nftperp.xyz",
    chainId: 42161,
    chainId_blast: 81457,
    rpcUrl: "https://rpc.ankr.com/arbitrum",
    rpcUrl_blast: "https://rpc.ankr.com/blast",
    contracts: {
        clearingHouse: "0x9e8B6D29C0410B8c7E67bB151CA7C0f9F6cBa8bF",
        clearingHouse_blast: "0xFfc0555EC5F5C44A6B529Cef94b9055799696272",
        insuranceFund: "0x087E8C29d0743120A9b9d003F702FB7F450291ba",
        insuranceFund_blast: "0xe2F4A2845D4183F7913EC66945b20E4c0c15DAFf",
        priceFeed: "0xE9725791a6A7D16355bF939f75f7011753e87583",
        priceFeed_blast: "0x780Fa04Fe4806b31359bd612dAe85D60Eab7C6d4",
        whitelist: "0xc98f3436A5dC926F66091E8a68CC027aa1ecCBb6",
        whitelist_blast: "0x2f6b968B487010b0F2D5DCdF7F4D5a0811E08aF1",
        weth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        weth_blast: "0x4300000000000000000000000000000000000004",
        degenDraw_blast: "0xfB33141A9C0201a998B44B64684d056C7560E395",
        amms: {
            milady: "0x66945724757a91199AB0B0c77EcBB90abA897F75",
            ppg: "0xd28485258d6926B81602b84CACF43BA99ACf93a5",
            punks_blast: "0x82F35795Dbe3a34e7c3242826E5ac92d150C097e",
            ppg_blast: "0x234FD1e34c60BE2FFb3B6EA8AA2387644f1e35F9",
            milady_blast: "0x80532f01eD2Cc8e962251bA23D2A3F481E62A203",
        },
    },
};
