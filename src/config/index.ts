import { Config } from "../types";

export const config: Config = {
    PAPER_TRADING: {
        apiBaseUrl: "https://api.nftperp.xyz",
        apiWsUrl: "https://api.nftperp.xyz",
        chainId: 42161,
        ch: "0x965258f89b009b04c66415dD7aa0ABf10C94C75c",
        iF: "0xA024c85842F3Ad977f745D35C8f8fCd2F91dCCe9",
        weth: "0x0645669debc4cbbE5B3f7bE1C71029dfDC2f819B",
        amms: {
            bayc: "0xD4F42D2AbdabDF62eD480F5C943181588FD11116",
            milady: "0x54a70F5A105a3051338a72320E58Bc88fAAa8e49",
            ppg: "0x51874D88F4C182713a36c972EF97B345ad3dFdfa",
            cdb: "0x7942Cb4732fa3F3B3dfcc0290414b0067C4f1Dd1",
            cap: "0x4DE38c2c1F5c315BAf84B0fbbFd08387872e55Dc",
            sproto: "0xdb76b237755257339c1243542DfF7766a76dD486",
            sofa: "0x7c2102982fCA04721611069816e170952c777E6F",
            degods: "0xC63954Ee8bAf4f21Bc298bb61c5EdfDA725A46aA",
        },
    },
};
