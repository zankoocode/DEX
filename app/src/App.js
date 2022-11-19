
import React from "react";
import Main from "./components/main";
import SwapTab from "./components/swap";
import LiquidityTab from "./components/liquidity";

//import "./App.css"

import {BrowserRouter as Router, Route , Routes} from 'react-router-dom';


function App() {
    return (
      <Router >
        <Routes >
         
          <Route exact path="/" element={<Main />}>
           
          </Route>

          <Route path="/swap" element={<SwapTab />} >

          </Route>

          <Route path="/liquidity" element={<LiquidityTab />} >

          </Route>
        </Routes>
      </Router>
    )

}

export default App;