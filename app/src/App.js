
import React from "react";
import Home from "./components/home";
import SwapTab from "./components/swap";
import LiquidityTab from "./components/liquidity";



import {BrowserRouter as Router, Route , Switch} from 'react-router-dom';


function App() {
    return (
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
    )

}

export default App;