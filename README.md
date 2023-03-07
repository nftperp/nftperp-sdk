# nftperp sdk ✨

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

SDK to interact with the nftperp protocol ([docs](https://nftperp.notion.site/nftperp/nftperp-xyz-2b456a853321481bac47e5a1a6bbfd4e)).

_tldr; nftperp is a derivates platform for nfts. for the first time ever, short nfts with leverage_

The protocol is currently in BETA on arbitrum mainnet ([dapp](https://staging.nftperp.xyz)). it uses fake eth for paper trading, which can be obtained from faucet on website

![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)

For any queries, hop in the community discord and ask away [invite link](https://discord.gg/J5vUUcTE6F)

---

-   [Installation](#installation)
-   [Terminology](#terminology)
-   [Usage](#usage)

---

### Installation

```sh
npm i @nftperp/sdk
```

Also requires `ethers` library  
**NOTE:** If `npm i ethers` is used, it will default to installing `ethers v6`, which will create errors when initialising the SDK

```sh
npm i ethers@5
```



### Usage

#### Setup

```ts
import { ethers } from "ethers";
import { SDK } from "@nftperp/sdk";
import { Instance } from "@nftperp/sdk/types";

/**
the general rpc url for arb mainnet is "https://arb1.arbitrum.io/rpc"
recommended using one from infura/alchemy
*/
const provider = new ethers.providers.JsonRpcProvider("<your-rpc-url>");
const wallet = new ethers.Wallet("<your-private-key>", provider);
const nftperp = new SDK({ wallet, instance: Instance.TRADING_COMP });
```  

If an error of the following occurs: `SyntaxError: Cannot use import statement outside a module`, add in the following to your `package.json` file  

```json
"type": "module"
```

If an error of the following occurs: `Directory import '..\@nftperp\sdk\types' is not supported resolving ES modules`, do the following:

```ts
// REPLACE
import { Instance } from "@nftperp/sdk/types";
// WITH
import { Instance } from "@nftperp/sdk/types/index.js";
```

#### Open a position

```ts
import { Amm, Side } from "@nftperp/sdk/types";

const hash = await nftperp.openPosition({
    amm: Amm.BAYC,
    side: Side.BUY,
    amount: 0.1, // 0.1 eth
    leverage: 3,
});
```

_note_: _to get a list of supported amms do:_

```ts
console.log(nftperp.getSupportedAmms(Instance.BETA));
/**
[ 'BAYC', 'PUNKS', '...' ]
*/
```

#### Get postion

```ts
const position = await nftperp.getPosition(Amm.BAYC);
```

#### Close position

```ts
const hash = await nftperp.closePosition({
    amm: Amm.BAYC,
});
```

#### Estimate fee on position

```ts
const feeInfo = await nftperp.calcFee({
    amm: Amm.BAYC,
    amount: 1,
    leverage: 1,
    side: Side.BUY,
    open: true, // true for opening pos, false for closing
});
```

#### Calculate open position transaction summary

```ts
const txSummary = await nftperp.getOpenPosTxSummary({
    amm: Amm.BAYC,
    amount: 1,
    leverage: 1,
    side: Side.BUY,
});
```

#### Calculate close position transaction summary

```ts
const txSummary = await nftperp.getClosePosTxSummary({
    amm: Amm.BAYC,
    closePercent: 100,
});
```

#### Get mark price

```ts
const markPrice = await nftperp.getMarkPrice(Amm.BAYC);
```

#### Get index price

```ts
const indexPrice = await nftperp.getIndexPrice(Amm.BAYC);
```

#### Get funding info

```ts
const fundingInfo = await nftperp.getFundingInfo(Amm.BAYC);
```
