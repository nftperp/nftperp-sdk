# nftperp sdk ✨

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

SDK to interact with the nftperp protocol.
The protocol is currently in BETA and running on arbitrum mainnet with fake eth (can be obtained from faucet on website).

### Prerequisites

-   git
-   nodejs >= 14

### Terminologies

-   `asset` the nft collection to trade. synonymous to "market pair", "amm".
-   `direction` direction of trade. long or short.
-   `margin` collateral amount. this is what you risk to lose on position liquidation.
-   `notional` total value of position (margin \* leverage).
-   `margin ratio` margin to notional ratio.
-   `maintenance margin ratio` minimum margin ratio to be maintained, below which liquidation occurs.

### Installation

```sh
npm i @nftperp/sdk
```

Also requires `ethers`

```sh
npm i ethers
```

### Usage

-   Setup

```ts
import ethers from "ethers";
import SDK from "@nftperp/sdk";

// the general rpc url for arb mainnet is "https://arb1.arbitrum.io/rpc"
// or you use alchemy to get a personal one for faster performace
const provider = new ethers.providers.JsonRpcProvider("<your-rpc-url>");
const wallet = new ethers.Wallet("<your-private-key>", provider);
const nftperp = new SDK(wallet);
```

-   Open a position

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

-   Get postion info

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

-   Close a position

```ts
const hash = await nftperp.closePosition({
    asset: "bayc",
});
```
