import Big from "big.js";
import { BigNumber } from "ethers";
import { Decimal } from "../types";

export const big = (value: string | number | BigNumber | Big): Big => {
    return Big(value.toString());
};

export const fromWei = (value: string | number | BigNumber | Big, decimals = 18): Big => {
    return big(value).div(Math.pow(10, decimals));
};

export const toWei = (value: string | number | BigNumber | Big, decimals = 18): Big => {
    return big(value).mul(Math.pow(10, decimals)).round(0, 0); // wei cannot be in decimal
};

export const decimal = (value: string | number | BigNumber | Big): Decimal => {
    return { d: big(value).toFixed() };
};

export const fromDecimal = (value: Decimal): Big => {
    return big(value.d);
};

export const fromDecimalWei = (value: Decimal): Big => {
    return fromWei(fromDecimal(value));
};

export const toDecimalWei = (value: string | number | BigNumber | Big): Decimal => {
    return decimal(toWei(value));
};

export const toDecimalWeiString = (value: string | number | BigNumber | Big): { d: string } => {
    return { d: stringify(toWei(value)) };
};

export const stringify = (value: string | number | BigNumber | Big): string => {
    return big(value).toFixed();
};
