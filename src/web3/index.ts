import Big from "big.js";
import abis from "../abis";
import * as ethers from "ethers";
import * as utils from "../utils";
import * as types from "../types";
export * from "ethers";

export const getProvider = (params: { network: types.Network; rpcUrl?: string }) => {
    const { network, rpcUrl } = params;
    const rpc = rpcUrl || utils.getRpcUrl(network);
    const provider = new ethers.JsonRpcProvider(rpc);
    return provider;
};

export const getClearingHouseInstance = (params: {
    network: types.Network;
    rpcUrl?: string;
    wallet?: ethers.Wallet;
}): types.ClearingHouse => {
    const { network, rpcUrl, wallet } = params;
    const signerOrProvider = wallet || getProvider({ network, rpcUrl });
    const clearingHouseAddress = utils.getClearingHouseAddress(network);
    const clearingHouse = new ethers.Contract(clearingHouseAddress, abis.clearingHouse, signerOrProvider);
    return clearingHouse as unknown as types.ClearingHouse;
};

export const getInsuranceFundInstance = (params: {
    network: types.Network;
    rpcUrl?: string;
    wallet?: ethers.Wallet;
}): types.InsuranceFund => {
    const { network, rpcUrl, wallet } = params;
    const signerOrProvider = wallet || getProvider({ network, rpcUrl });
    const insuranceFundAddress = utils.getInsuranceFundAddress(network);
    const insuranceFund = new ethers.Contract(insuranceFundAddress, abis.insuranceFund, signerOrProvider);
    return insuranceFund as unknown as types.InsuranceFund;
};

export const getWethInstance = (params: {
    network: types.Network;
    rpcUrl?: string;
    wallet?: ethers.Wallet;
}): types.ERC20 => {
    const { network, rpcUrl, wallet } = params;
    const signerOrProvider = wallet || getProvider({ network, rpcUrl });
    const wethAddress = utils.getWethAddress(network);
    const weth = new ethers.Contract(wethAddress, abis.erc20, signerOrProvider);
    return weth as unknown as types.ERC20;
};

export const checksum = ethers.getAddress;

export const getBalance = async (params: {
    address: string;
    rpcUrl?: string;
    network: types.Network;
}): Promise<Big> => {
    const { address, rpcUrl, network } = params;
    const provider = getProvider({ network, rpcUrl });
    const balance = utils.fromWei(await provider.getBalance(address));
    return balance;
};

export const getWethBalance = async (params: {
    address: string;
    rpcUrl?: string;
    network: types.Network;
}): Promise<Big> => {
    const { address, rpcUrl, network } = params;
    const weth = getWethInstance({ network, rpcUrl });
    const balance = utils.fromWei(await weth.balanceOf(address));
    return balance;
};
