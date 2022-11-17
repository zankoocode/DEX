import { BigNumber, providers, utils } from "ethers";
import React from "react";
import Main from "./components/main";
import SwapTab from "./components/swap";
import LiquidityTab from "./components/liquidity";

//import "./App.css"

import {BrowserRouter as Router, Route } from 'react-router-dom';

function App() {
    return (
      <Router >

        <Route path="/" >
          <Main />
        </Route>
        
        <Route path="/swap">
          <SwapTab />
        </Route>

        <Route path="/liquidty">
          <LiquidityTab />
        </Route>

      </Router>
    )

}

export default App;