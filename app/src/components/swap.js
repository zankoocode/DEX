import { BigNumber, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";

import {
    getZCDTokensBalance,
    getEtherBalance,
    getLPTokensBalance,
    getReserveOfZCDTokens,
  } from "../utils/getAmounts";
  import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap";
  import Web3Modal from "web3modal";

function SwapTab () {

    
      /** General state variables */
  // loading is set to true when the transaction is mining and set to false when
  // the transaction has mined
  const [loading, setLoading] = useState(false);




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
  // This variable is the `0` number in form of a BigNumber
  const zero = BigNumber.from(0);
 
  /** Variables to keep track of swap functionality */
  // Amount that the user wants to swap
  const [swapAmount, setSwapAmount] = useState("");
  // This keeps track of the number of tokens that the user would receive after a swap completes
  const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] =
    useState(zero);
  // Keeps track of whether  `Eth` or `zankoocode` token is selected. If `Eth` is selected it means that the user
  // wants to swap some `Eth` for some `zankoocode` tokens and vice versa if `Eth` is not selected
  const [ethSelected, setEthSelected] = useState(true);


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

  /**** SWAP FUNCTIONS ****/

  /**
   * swapTokens: Swaps  `swapAmountWei` of Eth/zankoocode tokens with `tokenToBeReceivedAfterSwap` amount of Eth/zankoocode tokens.
   */
  const _swapTokens = async () => {
    try {
      // Convert the amount entered by the user to a BigNumber using the `parseEther` library from `ethers.js`
      const swapAmountWei = utils.parseEther(swapAmount);
      // Check if the user entered zero
      // We are here using the `eq` method from BigNumber class in `ethers.js`
      if (!swapAmountWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        // Call the swapTokens function from the `utils` folder
        await swapTokens(
          signer,
          swapAmountWei,
          tokenToBeReceivedAfterSwap,
          ethSelected
        );
        setLoading(false);
        // Get all the updated amounts after the swap
        await getAmounts();
        setSwapAmount("");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setSwapAmount("");
    }
  };

  /**
   * _getAmountOfTokensReceivedFromSwap:  Returns the number of Eth/zankoocode tokens that can be received
   * when the user swaps `_swapAmountWEI` amount of Eth/zankoocode tokens.
   */
  const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
    try {
      // Convert the amount entered by the user to a BigNumber using the `parseEther` library from `ethers.js`
      const _swapAmountWEI = utils.parseEther(_swapAmount.toString());
      // Check if the user entered zero
      // We are here using the `eq` method from BigNumber class in `ethers.js`
      if (!_swapAmountWEI.eq(zero)) {
        const provider = await getProviderOrSigner();
        // Get the amount of ether in the contract
        const _ethBalance = await getEtherBalance(provider, null, true);
        // Call the `getAmountOfTokensReceivedFromSwap` from the utils folder
        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
          _swapAmountWEI,
          provider,
          ethSelected,
          _ethBalance,
          reservedZCD
        );
        settokenToBeReceivedAfterSwap(amountOfTokens);
      } else {
        settokenToBeReceivedAfterSwap(zero);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /*** END ***/


  if (loading) {
    return (
      <div className="loading-time-sec">
    <button className="loading">Waiting...</button>
    </div>
    )
  }

  return (
    <div className="swap-sec">
      <input
        type="number"
        placeholder="Amount"
        onChange={async (e) => {
          setSwapAmount(e.target.value || "");
          // Calculate the amount of tokens user would receive after the swap
          await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
        }}
        className="swap-input"
        value={swapAmount}
      />
      <select
        className="token-select"
        name="dropdown"
        id="dropdown"
        onChange={async () => {
          setEthSelected(!ethSelected);
          // Initialize the values back to zero
          await _getAmountOfTokensReceivedFromSwap(0);
          setSwapAmount("");
        }}
      >
        <option value="eth">Ethereum</option>
        <option value="zankoocodeToken">zankoocode Token</option>
      </select>
      <br />
      <div className="input-div">
        {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
        {ethSelected
          ? `You will get ${utils.formatEther(
              tokenToBeReceivedAfterSwap
            )} zankoocode Tokens`
          : `You will get ${utils.formatEther(
              tokenToBeReceivedAfterSwap
            )} Eth`}
      </div>
      <button className="swap-button" onClick={_swapTokens}>
        Swap
      </button>
    </div>
  );
}



export default SwapTab;