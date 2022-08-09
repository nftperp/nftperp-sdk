import { AddressConfig } from "../types/types";

export const ASSETS = ["bayc", "moonbirds", "mayc", "doodles", "clonex"] as const;

const addressConfig: AddressConfig = {
    ch: "0x23046B6bc1972370A06c15f6d4F589B7607caD5E",
    chv: "0x43e870F2E26d5415367A30985075F90bBb5a5E9A",
    iF: "0x3594FDDdF773e44AbFB2E5E16e59Be401c6eb235",
    weth: "0xCFc27f521576afAA8397cdb65c7b52eDDDF93579",
    assets: {
        bayc: "0x7273c7aE8F597BEfAEDCA07B6491ba6C876c2a89",
        moonbirds: "0xb50BedcA449f7F9980c3606e4Fe1FB8F48C6A228",
        mayc: "0x0a85c1a91C817A6836b8a4B706365A73e2BB1225",
        doodles: "0x904aD4EdAA907ed274AFbafb91804a6D98ab9c4c",
        clonex: "0xfcB2B0660Fe2eFb49Bbb1330Bf74AdccF18736EB",
    },
};

export default addressConfig;
