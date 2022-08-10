import Big from "big.js";
import { BigNumber } from "ethers";
import { Decimal } from "../../types/types";

export const toDecimal = (value: Big | BigNumber | number | string): Decimal => {
    return { d: value.toString() };
};

export const fromDecimal = (value: Decimal): Big => {
    return Big(value.d.toString());
};

export const toWei = (value: Big | BigNumber | number | string, decimals = 18): Big => {
    return Big(value.toString()).mul(10 ** decimals);
};

export const fromWei = (value: Big | BigNumber, decimals = 18): Big => {
    return Big(value.toString()).div(10 ** decimals);
};

export const toBig = (value: BigNumber | string | number): Big => {
    return Big(value.toString());
};

export const format = (value: Big, precision = 3, roundUp = false): number => {
    return value.round(precision, +roundUp).toNumber();
};

export const countDecimalPlacesInNumber = (value: number): number => {
    const stringified = String(value);
    const index = stringified.indexOf(".");
    return index === -1 ? 0 : stringified.length - index - 1;
};
