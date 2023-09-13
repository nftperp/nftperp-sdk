import Big from "big.js";
import { BigNumber } from "ethers";

export const big = (value: string | number | BigNumber | Big): Big => {
    return Big(value.toString());
};

export const fromWei = (value: string | number | BigNumber | Big, decimals = 18): Big => {
    return big(value).div(Math.pow(10, decimals));
};

export const toWei = (value: string | number | BigNumber | Big, decimals = 18): Big => {
    return big(value).mul(Math.pow(10, decimals)).round(0, 0); // wei cannot be in decimal
};

export const fromWeiStr = (value: string | number | BigNumber | Big, decimals = 18): string => {
    return stringify(fromWei(value, decimals));
};

export const toWeiStr = (value: string | number | BigNumber | Big, decimals = 18): string => {
    return stringify(toWei(value, decimals));
};

export const stringify = (value: string | number | BigNumber | Big): string => {
    return big(value).toFixed();
};

export const numerify = (value: string | number | BigNumber | Big): number => {
    return +big(value).toFixed();
};
