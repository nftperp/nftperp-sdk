# nftperp sdk ✨

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

SDK to interact with the [nftperp protocol](https://nftperp.xyz)

![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)

For any queries, join our discord [invite link](https://discord.gg/J5vUUcTE6F)

---

-   [Installation](#installation)
-   [Usage](#usage)

---

### Installation

```sh
npm i @nftperp/sdk
```

**NOTE:** Make sure you have `ethers@5` installed. `ethers v6`, which will create errors when initialising the SDK

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
const nftperp = new SDK({ wallet, instance: Instance.PAPER_TRADING });
```

#### Create a market order

```ts
import { Amm, Side } from "@nftperp/sdk/types";

const tx = await nftperp.createMarketOrder({
    amm: Amm.BAYC,
    side: Side.BUY,
    margin: 0.1, // in eth
    leverage: 3,
});
```

_note_: _to get a list of supported amms do:_

```ts
console.log(nftperp.getSupportedAmms(Instance.PAPER_TRADING));
/**
[ 'BAYC', 'PUNKS', '...' ]
*/
```

#### Create a limit order

```ts
import { Side } from "@nftperp/sdk/types";

const tx = await nftperp.createLimitOrder({
    amm: AMM.BAYC,
    side: Side.SELL,
    price: 30,
    margin: 0.1,
    leverage: 1,
});
```

#### Get postion

```ts
const position = await nftperp.getPosition(Amm.BAYC);
```

#### Create a trigger order (Stop loss/Take profit)

```ts
import { Side, TriggerType } from "@nftperp/sdk/types";

const hash = await nftperp.createTriggerOrder({
    amm: Amm.BAYC,
    price: 20,
    size: 0.1 // in BAYC
    type: TriggerType.TAKE_PROFIT
});
```

#### Close position

```ts
const hash = await nftperp.closePosition({
    amm: Amm.BAYC,
});
```

#### Calculate open position transaction summary

```ts
const summary = await nftperp.getOpenSummary({
    amm: Amm.BAYC,
    amount: 1,
    leverage: 1,
    side: Side.BUY,
});
```

#### Calculate close position transaction summary

```ts
const summary = await nftperp.getCloseMarketSummary({ amm: Amm.BAYC });
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

#### Get historical trades

```ts
await nftperp.getTrades({ amm: Amm.BAYC, trader: "<trader-address>" });
await nftperp.getTrades({ from: 1680307200, to: 1682899200, sort: Sort.ASC });
await nftperp.getTrades({ hash: "<transaction-hash>" });
```

#### Get historical fundings

```ts
await nftperp.getFundings({ amm: Amm.BAYC });
await nftperp.getFundings({ from: 1680307200, to: 1682899200, sort: Sort.ASC });
await nftperp.getFundings({ hash: "<transaction-hash>" });
```
