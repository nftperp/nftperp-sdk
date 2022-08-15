import { config } from "../../config";
import { Amm, Instance, InstanceConfig } from "../../types";
import { _throw } from "../common/commonUtil";

export const getInstanceConfig = (instance: Instance): InstanceConfig => {
    return config[instance];
};

export const getAmmAddress = (instance: Instance, amm: Amm): string => {
    const { amms } = config[instance];
    const addr = amms[amm];
    if (!addr) {
        _throw(`amm ${amm} does not exist on instance ${instance}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return addr!;
};
