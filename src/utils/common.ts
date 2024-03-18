import * as config from "../config";
import * as types from "../types";

export const getEnvVar = (varName: string): string => {
    const val = process.env[varName];
    if (!val) throw `env var ${varName} not found`;
    return val;
};

export const shortAddr = (addr: string): string => {
    return `${addr.slice(0, 5)}...${addr.slice(-5)}`;
};

export const getRpcUrl = (network: types.Network): string => {
    switch (network) {
        case "blast":
            return config.info.rpcUrl_blast;
        default:
            return config.info.rpcUrl;
    }
};

export const getClearingHouseAddress = (network: types.Network): string => {
    switch (network) {
        case "blast":
            return config.info.contracts.clearingHouse_blast;
        default:
            return config.info.contracts.clearingHouse;
    }
};

export const getInsuranceFundAddress = (network: types.Network): string => {
    switch (network) {
        case "blast":
            return config.info.contracts.insuranceFund_blast;
        default:
            return config.info.contracts.insuranceFund;
    }
};

export const getWethAddress = (network: types.Network): string => {
    switch (network) {
        case "blast":
            return config.info.contracts.weth_blast;
        default:
            return config.info.contracts.weth;
    }
};

export const getChainId = (network: types.Network): number => {
    switch (network) {
        case "blast":
            return config.info.chainId_blast;
        default:
            return config.info.chainId;
    }
};

export const getNetworkFromAmmName = (ammName: types.Amm): types.Network => {
    const network = (ammName.split("_")[1] || `arb`) as types.Network;
    return network;
};
