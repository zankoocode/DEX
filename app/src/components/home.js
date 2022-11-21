import React from "react";
import { useSelector, useDispatch} from "react-redux";

import {  selectWalletConnected, 
          getProvider,
          getSigner,
          selectWeb3Signer} from "../utils/features/walletSlice";
import {useHistory} from 'react-router-dom';


import './home.css';
import {  getEtherBalanceAddress,
           getEtherBalanceContract,
            getLPTokensBalance, 
             getReserveOfZCDTokens,
              getZCDTokensBalance } from "../utils/features/getAmountsSlice";


function Home () {

  const dispatch = useDispatch();

  const walletConnected = useSelector(selectWalletConnected);
  const history = useHistory();
  const web3Provider = useSelector(state => state.wallet.web3Provider);
  const web3Signer = useSelector(selectWeb3Signer);
  

    
  
    const goToSwapTab = (e) => {
        e.preventDefault();
      history.push('/swap')
    }
    const goToLiquidityTab = e => {
        e.preventDefault();
        history.push('/liquidity')
    }

    
    const getAmounts = async () => {
      try {
        const provider = web3Provider;
        const signer = web3Signer;
        const address = signer.getAddress();
        console.log(address)
       // const address = await signer.getAddress();
        dispatch(getEtherBalanceAddress({provider: provider, address: address}));
        dispatch(getEtherBalanceContract(provider));
        dispatch(getZCDTokensBalance({provider: provider, address: address}));
        dispatch(getLPTokensBalance({provider: provider, address: address}));
        dispatch(getReserveOfZCDTokens(provider));
        
      } catch (err) {
        console.log(err);
      }
    }
    const walletConnect = async() => {
      // get both provider and signer
       dispatch(getProvider());
       dispatch(getSigner());

    }

    if(walletConnected) {
      getAmounts();
    }
    if(!walletConnected){
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