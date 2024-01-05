import Big from "big.js";

export const big = (value: string | number | bigint | Big): Big => {
    return Big(value.toString());
};

export const fromWei = (value: string | number | bigint | Big, decimals = 18): Big => {
    return big(value).div(Math.pow(10, decimals));
};

export const toWei = (value: string | number | bigint | Big, decimals = 18): Big => {
    return big(value).mul(Math.pow(10, decimals)).round(0, 0); // wei cannot be in decimal
};

export const fromWeiStr = (value: string | number | bigint | Big, decimals = 18): string => {
    return stringify(fromWei(value, decimals));
};

export const toWeiStr = (value: string | number | bigint | Big, decimals = 18): string => {
    return stringify(toWei(value, decimals));
};

export const stringify = (value: string | number | bigint | Big): string => {
    return big(value).toFixed();
};

export const numerify = (value: string | number | bigint | Big): number => {
    return +big(value).toFixed();
};
