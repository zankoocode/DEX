import React, { useEffect } from "react";
import { useSelector, useDispatch} from "react-redux";

import {  selectWalletConnected, 
          selectWalletConnectFail,  
          getProviderOrSigner,
          connectWallet,
          web3Connect} from "../utils/features/walletSlice";
import {useHistory} from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import './main.css';


function Main () {

  const dispatch = useDispatch();

  const walletConnected = useSelector(selectWalletConnected);

  const walletConnectFail = useSelector(selectWalletConnectFail);

  const history = useHistory();

  

    
  
    const goToSwapTab = () => {
      history.push('/swap')
    }
  
    const walletConnect = () => {
      // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
     // dispatch(web3Connect());
     // dispatch(connectWallet());
      dispatch(getProviderOrSigner())
    }
    if(walletConnected){
        return (
          
          <div className="not-connected-page"> 
            
                 <h1 className="zankoocodeDEX">
                      zankoocode DEX
                  </h1>
                  <button className="walletConnect-btn" onClick={walletConnect} > Connect Wallet</button>
            
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
                  goToSwapTab
                }
              >
                Liquidity
              </button>
              <button
                className="swap-tab-btn"
                //</div>onClick={
                  
                //}
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

export default Main;
