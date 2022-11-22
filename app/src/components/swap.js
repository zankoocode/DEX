import { BigNumber, utils } from "ethers";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";




 import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap";
 import './swap.css';

function SwapTab () {

    
      /** General state variables */
  // loading is set to true when the transaction is mining and set to false when
  // the transaction has mined
  const [loading, setLoading] = useState(false);

  const reservedZCD = useSelector();

  const etherBalanceContract = useSelector();

  const web3Signer = useSelector();
  const web3Provider = useSelector();
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
        
        console.log(web3Signer.getAddress())
        const signer = web3Signer;
        setLoading(true);
        // Call the swapTokens function from the `utils` folder
        await swapTokens(
          signer,
          swapAmountWei,
          tokenToBeReceivedAfterSwap,
          ethSelected
        );
        window.alert("token swap: successful");
        setLoading(false);
        // Get all the updated amounts after the swap
        
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
       
        const provider = web3Provider;
        // Get the amount of ether in the contract
        const _ethBalance = etherBalanceContract;
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

      <div className="image-div" >
            <img src="https://ipfs.io/ipfs/QmPu2y3gdiB5agUkiBBL15TFBHTtKMy6wP4TNuALdcYhkm"/>
            </div>

            made by @zankoocode
    </div>
  );
}



export default SwapTab;