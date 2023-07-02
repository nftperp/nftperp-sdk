# nftperp sdk ✨

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

SDK to interact with the nftperp protocol ([docs](https://nftperp.notion.site/nftperp/nftperp-xyz-2b456a853321481bac47e5a1a6bbfd4e)).

_tldr; nftperp is a derivates platform for nfts. for the first time ever, short nfts with leverage_

The protocol is currently in BETA on arbitrum mainnet ([dapp](https://staging.nftperp.xyz)). it uses fake eth for paper trading, which can be obtained from faucet on website

![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)

For any queries, hop in the community discord and ask away [invite link](https://discord.gg/J5vUUcTE6F)

---

-   [Installation](#installation)
-   [Usage](#usage)

---

### Installation

```sh
npm i @nftperp/sdk
```

Also requires `ethers` library  
**NOTE:** _ethers v6 introduced a lot of breaking changes and is unsupported yet. please install v5 as below_

```sh
npm i ethers@5
```

### Usage

#### Setup

```ts
import { ethers } from "ethers";
import { SDK } from "@nftperp/sdk";

/**
the general rpc url for arb mainnet is "https://arb1.arbitrum.io/rpc"
recommended using one from infura/alchemy

sdk is open source, `wallet` is safe to connect :wink:
*/
const provider = new ethers.providers.JsonRpcProvider("<your-rpc-url>");
const wallet = new ethers.Wallet("<your-private-key>", provider);
const nftperp = new SDK({ wallet });
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

#### Pre calculate fee on trade

```ts
const feeInfo = await nftperp.calcFee({
    amm: Amm.BAYC,
    amount: 1,
    leverage: 1,
    side: Side.BUY,
    open: true, // true for opening pos, false for closing
});
```

#### Pre calculate open position summary _(including ee)_

```ts
const txSummary = await nftperp.getOpenPosTxSummary({
    amm: Amm.BAYC,
    amount: 1,
    leverage: 1,
    side: Side.BUY,
});
```

#### Pre calculate close position transaction summary _(including fee)_

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

#### Get historical trades

```ts
await nftperp.getTrades({ amm: Amm.BAYC, trader: "<trader-address>" });
await nftperp.getTrades({ from: 1680307200, to: 1682899200, sort: Sort.ASC });
await nftperp.getTrades({ hash: "<transaction-hash>" });
```

_note_: _this method is paginated, so use `page` to loop through!_

#### Get historical fundings

```ts
await nftperp.getFundings({ amm: Amm.BAYC });
await nftperp.getFundings({ from: 1680307200, to: 1682899200, sort: Sort.ASC });
await nftperp.getFundings({ hash: "<transaction-hash>" });
```

_note_: _this method is paginated, so use `page` to loop through!_

#### Streamer

Stream realtime events! directly consume parsed event data!

```ts
import { EVENT } from "@nftperp/sdk/types";

nftperp.on(EVENT.TRADE, (trade) => {});
nftperp.on(EVENT.FUNDING, (funding) => {});
```
