# nftperp sdk ✨

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

SDK to interact with the nftperp protocol.

_tldr; nftperp is a derivates platform for nfts. for the first time ever, short nfts with leverage_

[docs](https://nftperp.notion.site/nftperp/nftperp-xyz-2b456a853321481bac47e5a1a6bbfd4e)

The protocol is currently in BETA on arbitrum mainnet. it uses fake eth for paper trading, which can be obtained from faucet on website/sdk

[beta](https://staging.nftperp.xyz)

![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)

For any queries, hop in the community discord and ask away [invite link](https://discord.gg/J5vUUcTE6F)

### Terminologies

-   `asset` the nft collection to trade. synonymous to _market pair_, _amm_.

-   `direction` direction of trade. _long_ or _short_.
-   `margin` collateral amount. this is the amount you risk on liquidation.
-   `notional` total value of position _margin x leverage_.
-   `mark price` nftperp's price of the asset.
-   `index price` actual price of the asset. _floor from marketplaces_.
-   `margin ratio` margin to notional ratio.
-   `maintenance margin ratio` minimum margin ratio to be maintained to avoid liquidation.

### Installation

```sh
npm i @nftperp/sdk
```

Also requires `ethers` library

```sh
npm i ethers
```

### Usage

#### Setup

```ts
import ethers from "ethers";
import SDK from "@nftperp/sdk";

/**
the general rpc url for arb mainnet is "https://arb1.arbitrum.io/rpc", you can also use a personal one from alchemy (https://www.alchemy.com/)
*/
const provider = new ethers.providers.JsonRpcProvider("<your-rpc-url>");
const wallet = new ethers.Wallet("<your-private-key>", provider);
const nftperp = new SDK(wallet);
```

#### Obtaining paper ETH from faucet

```ts
await nftperp.useFaucet(); // grants 5 eth
```

#### Open a position

```ts
const hash = await nftperp.openPosition({
    asset: "bayc",
    direction: "long",
    margin: 0.1, // this means 0.1 eth
    leverage: 3,
});
```

_note_: _currently limited nft collections are supported. to get a list of supported assets do:_

```ts
console.log(nftperp.getSupportedAssets());
/**
[ 'bayc', 'moonbirds', 'mayc', 'doodles', 'clonex' ]
*/
```

#### Get postion info

```ts
const position = await nftperp.getPosition({
    asset: "bayc",
});
console.log(position);
/**
{
  size: 0.003,
  margin: 0.1,
  leverage: 3,
  pnl: 0,
  funding: 0,
  entryPrice: 82.981,
  liquidationPrice: 63.224
}
*/
```

#### Close a position

```ts
const hash = await nftperp.closePosition({
    asset: "bayc",
});
```

#### Get asset info

```ts
const assetInfo = await nftperp.getAssetInfo("bayc");
console.log(assetInfo);
/**
{
  asset: 'BAYC',
  markPrice: 82.795,
  indexPrice: 84,
  maxLeverage: 5,
  maintenanceMarginPercent: 12.5,
  fullLiquidationPercent: 10,
  previousFundingPercent: -0.662,
  nextFundingTime: 1660194024,
  openInterest: 3583.484,
  openInterestLongs: 2581.935,
  openInterestShorts: 1001.548
}
*/
```
