
import React from "react";
import Home from "./components/home";
import SwapTab from "./components/swap";
import LiquidityTab from "./components/liquidity";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";

import { Web3Modal } from "@web3modal/react";

import {BrowserRouter as Router, Route , Switch} from 'react-router-dom';

import { chain, configureChains, createClient, WagmiConfig } from "wagmi";

const chains = [chain.goerli];

// Wagmi client
const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId: "50c99053675ee3d2d6d7e508938bb227" }),
]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: "zankoocodeDEX", chains }),
  provider,
});

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains);




function App() {
    return (
      <>
      <WagmiConfig client={wagmiClient}>
      <Router >
        <Switch >
         
          <Route exact path="/">
           <Home />
          </Route>

          <Route path="/swap"  >
            <SwapTab />
          </Route>

            <Route path="/liquidity"  >
            <LiquidityTab />
          </Route>
        </Switch>
      </Router>
      </WagmiConfig>

      <Web3Modal
        projectId="50c99053675ee3d2d6d7e508938bb227"
        theme="light"
        accentColor="default"
        ethereumClient={ethereumClient}
      />
      </>
    )

}

export default App;