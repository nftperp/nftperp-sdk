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

#### Create a market order

```ts
import { Amm, Side } from "@nftperp/sdk/types";

const hash = await nftperp.createMarketOrder({
    amm: Amm.BAYC,
    side: Side.BUY,
    margin: 1, //in ETH
    leverage: 3,
    slippagePercent: 1
});
```

_note_: _to get a list of supported amms do:_

```ts
console.log(nftperp.getSupportedAmms(Instance.BETA));
/**
[ 'BAYC', 'PUNKS', '...' ]
*/
```

#### Create a limit order

```ts
import { Side } from "@nftperp/sdk/types";

const hash = await nftperp.createLimitOrder({
    trader: 0xaddress,
    amm: 'bayc',
    side: Side.BUY,
    trigger: 0, //only needed for trigger orders
    quoteAmount: 3, //bid amount in ETH
    leverage: 1,
    reduceOnly: false
    });
```

#### Update a limit order

```ts
import { Side } from "@nftperp/sdk/types";

const hash = await nftperp.createLimitOrder(orderId, {
    trader: 0xaddress,
    amm: 'bayc',
    side: Side.BUY,
    trigger: 0, //only needed for trigger orders
    quoteAmount: 3, //bid amount in ETH
    leverage: 1,
    reduceOnly: false
    });
```
