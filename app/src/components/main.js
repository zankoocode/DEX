import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { BigNumber, providers, utils } from "ethers";
import {Link} from 'react-router-dom';
import {
    getZCDTokensBalance,
    getEtherBalance,
    getLPTokensBalance,
    getReserveOfZCDTokens,
  } from "../utils/getAmounts";

function Main () {

    /** Variables to keep track of amount */
  // `ethBalance` keeps track of the amount of Eth held by the user's account
  const [ethBalance, setEtherBalance] = useState(zero);
  // `reservedZCD` keeps track of the Crypto Dev tokens Reserve balance in the Exchange contract
  const [reservedZCD, setReservedZCD] = useState(zero);
  // Keeps track of the ether balance in the contract
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
  // zcdBalance is the amount of `ZCD` tokens help by the users account
  const [zcdBalance, setZCDBalance] = useState(zero);
  // `lpBalance` is the amount of LP tokens held by the users account
  const [lpBalance, setLPBalance] = useState(zero);
    const web3ModalRef = useRef();
    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false);
    const zero = BigNumber.from(0);
   

  const getAmounts = async () => {
    try {
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      // get the amount of eth in the user's account
      const _ethBalance = await getEtherBalance(provider, address);
      // get the amount of `zankoocode` tokens held by the user
      const _zcdBalance = await getZCDTokensBalance(provider, address);
      // get the amount of `zankoocode` LP tokens held by the user
      const _lpBalance = await getLPTokensBalance(provider, address);
      // gets the amount of `ZCD` tokens that are present in the reserve of the `Exchange contract`
      const _reservedZCD = await getReserveOfZCDTokens(provider);
      // Get the ether reserves in the contract
      const _ethBalanceContract = await getEtherBalance(provider, null, true);
      setEtherBalance(_ethBalance);
      setZCDBalance(_zcdBalance);
      setLPBalance(_lpBalance);
      setReservedZCD(_reservedZCD);
      setReservedZCD(_reservedZCD);
      setEtherBalanceContract(_ethBalanceContract);
    } catch (err) {
      console.error(err);
    }
  };


    if(!walletConnected){
        return (
          
          <div className="not-connected-page"> 
            <body>
                 <h1 className="zankoocodeDEX">
                      zankoocode DEX
                  </h1>
            <button onClick={connectWallet} className="connect-button"> Connect Wallet </button>
          
          <div className="image-div" >
            <img src="https://ipfs.io/ipfs/QmPu2y3gdiB5agUkiBBL15TFBHTtKMy6wP4TNuALdcYhkm"/>
            </div>
    
            made by @zankoocode
            </body>
    
            
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
                className="liquidity-tab"
                onClick={() => {
                  <Link to={'/liquidity'} >

                  </Link>
                }}
              >
                Liquidity
              </button>
              <button
                className="swap-tab"
                onClick={() => {
                  <Link to={'/swap'} >
                    
                  </Link>
                }}
              >
                Swap
              </button>
                </div>
              <div className="image-sec">
                    <img src="https://ipfs.io/ipfs/QmPu2y3gdiB5agUkiBBL15TFBHTtKMy6wP4TNuALdcYhkm" />
                </div>
            
                
         
          Made by @zankoocode
        
                
        
      </div>
      )
    }
}

export default Main;
