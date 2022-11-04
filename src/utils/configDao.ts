import { config } from "../config";
import { Amm, Instance, InstanceConfig } from "../types";

export const getInstanceConfig = (instance: Instance): InstanceConfig => {
    return config[instance];
};

export const getAmmAddress = (instance: Instance, amm: Amm): string => {
    const { amms } = config[instance];
    const addr = amms[amm];
    if (!addr) {
        throw new Error(`amm ${amm} does not exist on instance ${instance}`);
    }
    return addr;
};
