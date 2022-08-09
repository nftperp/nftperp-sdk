import addressConfig from "../../../config/addresses";
import { Asset } from "../../../types/types";

export const getAssetAddress = (_asset: Asset): string => {
    return addressConfig.assets[_asset];
};

export const getChAddress = (): string => {
    return addressConfig.ch;
};

export const getChvAddress = (): string => {
    return addressConfig.chv;
};

export const getIfAddress = (): string => {
    return addressConfig.iF;
};

export const getWethAddress = (): string => {
    return addressConfig.weth;
};

export const _throw = (_msg: string) => {
    throw new Error(_msg);
};
