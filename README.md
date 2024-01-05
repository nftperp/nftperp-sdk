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

_also install `ethers` library_
```sh
npm i ethers
```

### Usage

#### Setup

```ts
import { ethers } from "ethers";
import { SDK } from "@nftperp/sdk";


const provider = new ethers.JsonRpcProvider("<your-rpc-url>");
const wallet = new ethers.Wallet("<your-private-key>", provider);
const nftperp = new SDK({ wallet });
```

#### Create a market order

```ts
import { Amm, Side } from "@nftperp/sdk/types";

const tx = await nftperp.openMarketOrder({
    amm: Amm.BAYC,
    side: Side.BUY,
    margin: 0.1, // in eth
    leverage: 3,
});
```

_note_: _to get a list of supported amms do:_

```ts
console.log(nftperp.getSupportedAmms());
/**
[ 'BAYC', 'MILADY', '...' ]
*/
```

#### Create a limit order

```ts
import { Side } from "@nftperp/sdk/types";

await nftperp.openLimitOrder({
    amm: AMM.BAYC,
    side: Side.SELL,
    price: 30,
    margin: 0.1,
    leverage: 1,
});
```

#### Get postion

```ts
await nftperp.getPosition(Amm.BAYC);
```

#### Create a trigger order (Stop loss/Take profit)

```ts
await nftperp.openTriggerOrder({
    amm: Amm.BAYC,
    price: 20,
    size: 0.1 // in BAYC
    type: TriggerType.TAKE_PROFIT
});
```

#### Close position

```ts
await nftperp.closePosition({ amm: Amm.BAYC });
```

#### Calculate open summary

> summary of entry price, price impact, fees etc to be implied on opening a position

```ts
await nftperp.getOpenSummary({
    amm: Amm.BAYC,
    amount: 1,
    leverage: 1,
    side: Side.BUY,
});
```

#### Calculate close summary

> summary of exit price, price impact, fees etc to be implied on closing a position

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

#### Get funding rate

```ts
const fundingRate = await nftperp.getFundingRate(Amm.BAYC);
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
