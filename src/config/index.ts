import { Config } from "../types";

export const config: Config = {
    TRADING_COMP: {
        apiBaseUrl: "https://api.nftperp.xyz/tc",
        chainId: 42161,
        ch: "0x1BBd56e80284B7064B44b2f4Bc494A268E614D36",
        chv: "0x50116ee8bC6C75d917E047fAa959398c78119813",
        iF: "0x745a2743a5CB63362a1f614C719ff982FB337f25",
        weth: "0x6cfbBAdC695fA71909F0191Ee5d6eeb259daF1eE",
        amms: {
            BAYC: "0xF34d6dc7f737B59c68854f7a139f71d9e0E37ee5",
            MILADY: "0x246A801C1905a8E0FcE3AaB6561966c8BfC3D7bf",
            PUNKS: "0xEe4826F21D47A6DEF4c3BaA6633bcec24D7A2375",
            AZUKI: "0x70A1Bee795A05F78a7185545c7e6A93D02442F5C",
            MAYC: "0xB92c47eBc522cae7edC911e3D62691420FE1E90a",
            DOODLES: "0xaC2Eadb88D9E4eEF34452943330f93E9A81De72d",
            MOONBIRDS: "0xB25E0D85Df2CAD9D8d3e9B033729634ECd737BF8",
            BGAN: "0x92B96d53cead8F3E13BCEe03F1d9691A50194D1a",
            GOBBLERS: "0xE56472DDCC9100d933a3D9e1b59c1C63F9f83DD2",
        },
    },
    BETA: {
        apiBaseUrl: "https://api.nftperp.xyz/beta",
        chainId: 42161,
        ch: "0xF685280562a045c09d10CC41510d1e31e17D8f0c",
        chv: "0xd8b81184DC3d4bbc5cD372107ce0de41eC9a51d6",
        iF: "0xA04dDd561C5862a4cba57323f4aDEa6c56e7CDaC",
        weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        amms: {
            BAYC: "0xF8981A36DB5d33E48ff366a41280bA2c46829e10",
        },
    },
};
