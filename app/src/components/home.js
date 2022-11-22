import React, { useState } from "react";



import {useHistory} from 'react-router-dom';
import { useAccount } from 'wagmi'

import './home.css';

import { Web3Button } from "@web3modal/react";

function Home () {


  const [walletConnected, setWalletConnected] = useState(false);
    const account = useAccount({
      onConnect(){
        setWalletConnected(true);
      }
    })
  const history = useHistory();
  
  
  
    const goToSwapTab = (e) => {
        e.preventDefault();
      history.push('/swap')
    }
    const goToLiquidityTab = e => {
        e.preventDefault();
        history.push('/liquidity')
    }
    
    
    
    
  
    if(!walletConnected){
        return (
          
          <div className="not-connected-page"> 
            
                 <h1 className="zankoocodeDEX">
                      zankoocode DEX
                  </h1>
                  <div className="connect-btn-div">
                 <Web3Button />
                 </div>
          <div className="image-div" >
            <img src="https://ipfs.io/ipfs/QmPu2y3gdiB5agUkiBBL15TFBHTtKMy6wP4TNuALdcYhkm"/>
            </div>
    
            made by @zankoocode
            
    
            
          </div>
          
        )
      } else {
    return (
        
    <div className="App">
        
            <h1 className="welcome">Welcome to zankoocode Exchange!</h1>
            <div className="DEX-description">
              Exchange Ethereum &#60;&#62; zankoocode Tokens
            </div>
            <div className="buttons">
              <button
                className="liquidity-tab-btn"
                onClick={
                  goToLiquidityTab
                }
              >
                Liquidity
              </button>
              <button
                className="swap-tab-btn"
                onClick={
                  goToSwapTab
                }
              >
                Swap
              </button>
                </div>
              <div className="image-div image-sec">
                    <img src="https://ipfs.io/ipfs/QmPu2y3gdiB5agUkiBBL15TFBHTtKMy6wP4TNuALdcYhkm" />
                </div>
            
               
         
          Made by @zankoocode
          
        
      </div>
      )
    }
}

export default Home;