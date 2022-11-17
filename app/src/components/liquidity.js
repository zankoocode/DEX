import React, { useEffect, useRef, useState } from "react";
import { BigNumber, providers, utils } from "ethers";
import {
    getZCDTokensBalance,
    getEtherBalance,
    getLPTokensBalance,
    getReserveOfZCDTokens,
  } from "../utils/getAmounts";
  import { addLiquidity, calculateZCD } from "../utils/addLiquidity";
  import {
    getTokensAfterRemove,
    removeLiquidity,
  } from "../utils/removeLiquidity";
  import Web3Modal from "web3modal";


  
function LiquidityTab () {

/** General state variables */
  // loading is set to true when the transaction is mining and set to false when
  // the transaction has mined
  const [loading, setLoading] = useState(false);
 // This variable is the `0` number in form of a BigNumber
 const zero = BigNumber.from(0);


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
  /** Variables to keep track of liquidity to be added or removed */
  // addEther is the amount of Ether that the user wants to add to the liquidity
  const [addEther, setAddEther] = useState(zero);
  // addZCDTokens keeps track of the amount of ZCD tokens that the user wants to add to the liquidity
  // in case when there is no initial liquidity and after liquidity gets added it keeps track of the
  // CD tokens that the user can add given a certain amount of ether
  const [addZCDTokens, setAddZCDTokens] = useState(zero);
  // removeEther is the amount of `Ether` that would be sent back to the user based on a certain number of `LP` tokens
  const [removeEther, setRemoveEther] = useState(zero);
  // removeZCD is the amount of `zankoocode` tokens that would be sent back to the user based on a certain number of `LP` tokens
  // that he wants to withdraw
  const [removeZCD, setRemoveZCD] = useState(zero);
  // amount of LP tokens that the user wants to remove from liquidity
  const [removeLPTokens, setRemoveLPTokens] = useState("0");
  // border colors based the input 
  const [colorBorderLP, setColorBorderLP] = useState("");
  const [colorBorderEther, setcolorBorderEther] = useState("");
  const [colorBorderZCD, setColorBorderZCD] = useState("");
  const [colorBorderEth, setColorBorderEth] = useState("");

  const web3ModalRef = useRef();
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  /**
 * Returns a Provider or Signer object representing the Ethereum RPC with or
 * without the signing capabilities of Metamask attached
 *
 * A `Provider` is needed to interact with the blockchain - reading
 * transactions, reading balances, reading state, etc.
 *
 * A `Signer` is a special type of Provider used in case a `write` transaction
 * needs to be made to the blockchain, which involves the connected account
 * needing to make a digital signature to authorize the transaction being
 * sent. Metamask exposes a Signer API to allow your website to request
 * signatures from the user using Signer functions.
 *
 * @param {*} needSigner - True if you need the signer, default false
 * otherwise
 */
  const getProviderOrSigner = async (needSigner = false) => {
  // Connect to Metamask
  // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider);

  // If user is not connected to the Goerli network, let them know and throw an error
  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 5) {
    window.alert("Change the network to Goerli");
    throw new Error("Change network to Goerli");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
};


// useEffects are used to react to changes in state of the website
// The array at the end of function call represents what state changes will trigger this effect
// In this case, whenever the value of `walletConnected` changes - this effect will be called
useEffect(() => {
  // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
  if (!walletConnected) {
    // Assign the Web3Modal class to the reference object by setting it's `current` value
    // The `current` value is persisted throughout as long as this page is open
    web3ModalRef.current = new Web3Modal({
      network: "goerli",
      providerOptions: {},
      disableInjectedProvider: false,
    });
    connectWallet();
    getAmounts();
    
  }
}, [walletConnected]);

 /**
 * connectWallet: Connects the MetaMask wallet
 */
  const connectWallet = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // When used for the first time, it prompts the user to connect their wallet
        await getProviderOrSigner();
        setWalletConnected(true);
      } catch (err) {
        console.error(err);
      }
    };
      

      /**
   * getAmounts call various functions to retrive amounts for ethbalance,
   * LP tokens etc
   */
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


  /**** ADD LIQUIDITY FUNCTIONS ****/

  /**
   * _addLiquidity helps add liquidity to the exchange,
   * If the user is adding initial liquidity, user decides the ether and ZCD tokens he wants to add
   * to the exchange. If he is adding the liquidity after the initial liquidity has already been added
   * then we calculate the crypto dev tokens he can add, given the Eth he wants to add by keeping the ratios
   * constant
   */
   const _addLiquidity = async () => {
    try {
      // Convert the ether amount entered by the user to Bignumber
      const addEtherWei = utils.parseEther(addEther.toString());
      // Check if the values are zero
      if (!addZCDTokens.eq(zero) && !addEtherWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        // call the addLiquidity function from the utils folder
        await addLiquidity(signer, addZCDTokens, addEtherWei);
        setLoading(false);
        // Reinitialize the ZCD tokens
        setAddZCDTokens(zero);
        // Get amounts for all values after the liquidity has been added
        await getAmounts();
        alert('you have successfully added liquidity');
      } else {
        setAddZCDTokens(zero);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setAddZCDTokens(zero);
    }
  };

  /**** REMOVE LIQUIDITY FUNCTIONS ****/

  /**
   * _removeLiquidity: Removes the `removeLPTokensWei` amount of LP tokens from
   * liquidity and also the calculated amount of `ether` and `ZCD` tokens
   */
  const _removeLiquidity = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      // Convert the LP tokens entered by the user to a BigNumber
      const removeLPTokensWei = utils.parseEther(removeLPTokens);
      setLoading(true);
      // Call the removeLiquidity function from the `utils` folder
      await removeLiquidity(signer, removeLPTokensWei);
      setLoading(false);
      await getAmounts();
      setRemoveZCD(zero);
      setRemoveEther(zero);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setRemoveZCD(zero);
      setRemoveEther(zero);
    }
  };

  /**
   * _getTokensAfterRemove: Calculates the amount of `Ether` and `ZCD` tokens
   * that would be returned back to user after he removes `removeLPTokenWei` amount
   * of LP tokens from the contract
   */
  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      // Convert the LP tokens entered by the user to a BigNumber
      const removeLPTokenWei = utils.parseEther(_removeLPTokens);
      // Get the Eth reserves within the exchange contract
      const _ethBalance = await getEtherBalance(provider, null, true);
      // get the crypto dev token reserves from the contract
      const zankoocodeTokenReserve = await getReserveOfZCDTokens(provider);
      // call the getTokensAfterRemove from the utils folder
      const { _removeEther, _removeZCD } = await getTokensAfterRemove(
        provider,
        removeLPTokenWei,
        _ethBalance,
        zankoocodeTokenReserve
      );
      setRemoveEther(_removeEther);
      setRemoveZCD(_removeZCD);
    } catch (err) {
      console.error(err);
    }
    };


    if (loading) {
        return (
          <div className="loading-time-sec">
        <button className="loading">Waiting...</button>
        </div>
        )
      }
    
    return (
        <div className="App">
         <div className="description">
           You have {utils.formatEther(zcdBalance)} zankoocode tokens 
           <br />
           You have {utils.formatEther(ethBalance)} Ether
           <br />
           You have {utils.formatEther(lpBalance)} zankoocode LP tokens
         </div>
   
              {/* If reserved ZCD is zero, render the state for liquidity zero where we ask the user
               how much initial liquidity he wants to add else just render the state where liquidity is not zero and
               we calculate based on the `Eth` amount specified by the user how much `ZCD` tokens can be added */}
               {utils.parseEther(reservedZCD.toString()).eq(zero) ? (
                 <div className="liqudity-sec">
                   <input
                     type="number"
                     placeholder="Amount of Ether"
                     style={{border: colorBorderEther}}
                     onChange={
                       (e) => {
                         if (e.target.value > utils.formatEther(ethBalance)){
                           setcolorBorderEther("1.5px solid red")
                           
                         } else {
                           setcolorBorderEther("1.5px solid green")
                           setAddEther(e.target.value || "0")
                         }
                       }
                     }
                     className="input-ether-amount"
                   />
                   
                   <input
                     type="number"
                     placeholder="Amount of zankoocode tokens"
                     style={{border: colorBorderZCD}}
                     onChange={
                       (e) => {
                         if (e.target.value > utils.formatEther(zcdBalance)){
                           setColorBorderZCD("1.5px solid red")
                           
                         } else {
                           setColorBorderZCD("1.5px solid green")
                           setAddZCDTokens(
                             BigNumber.from(utils.parseEther(e.target.value || "0"))
                           )
                         }
                       }
                       
                     }
                     className="input-zankoocode-amount"
                   />
                   <button className="addLiquidity-button" onClick={_addLiquidity}>
                     Add
                   </button>
                 </div>
                 
               ) : (
                 <div className="addliq">
                   <input
                     type="number"
                     placeholder="Amount of Ether"
                     style={{border: colorBorderEth}}
                     onChange={
                       async (e) => {
                         if (e.target.value > utils.formatEther(ethBalance)) {
                           setColorBorderEth("1.5px solid red");
                         } else {
                           setColorBorderEth("1.5px solid green");
                       setAddEther(e.target.value || "0");
                       // calculate the number of ZCD tokens that
                       // can be added given  `e.target.value` amount of Eth
                       const _addZCDTokens = await calculateZCD(
                         e.target.value || "0",
                         etherBalanceContract,
                         reservedZCD
                       );
                       setAddZCDTokens(_addZCDTokens);
                       }
                     }
                   }
                     className="input-ether-amount"
                   />
                   <div className="ZCD-needed">
                     {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                     {`You will need ${utils.formatEther(addZCDTokens)} zankoocode
                     Tokens`}
                   </div>
                   <button className="addLiquidity-button2" onClick={_addLiquidity}>
                     Add
                   </button>
                 </div>
               )}
                 <div className="remove-liquidity-sec">
                 <input
                   type="number"
                   placeholder="Amount of LP Tokens"
                   style={{border: colorBorderLP}}
                   onChange={async (e) => {
   
                     if (e.target.value > utils.formatEther(lpBalance)){
                         setColorBorderLP("1.5px solid red");
                     } else {
                       setColorBorderLP("1.5px solid green");
                       setRemoveLPTokens(e.target.value || "0");
                       // Calculate the amount of Ether and CD tokens that the user would receive
                       // After he removes `e.target.value` amount of `LP` tokens
                       await _getTokensAfterRemove(e.target.value || "0");
                     }
                     
                   }}
                   className="lp-tokens-input"
                 />
                 <div className="input-div">
                   {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                   {`You will get ${utils.formatEther(removeZCD)} zankoocode
                  Tokens and ${utils.formatEther(removeEther)} Eth`}
                 </div>
                 <button className="removeLiquidity" onClick={_removeLiquidity}>
                   Remove
                 </button>
               </div>
            
        </div>
       )
}

export default LiquidityTab;