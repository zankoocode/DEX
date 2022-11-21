import React, {useState } from "react";
import { BigNumber, utils } from "ethers";
import { useSelector, useDispatch } from "react-redux";
import { getProvider, getSigner, selectWeb3Provider, selectWeb3Signer } from "../utils/features/walletSlice";
import {  selectEthBalance, selectEthBalanceContract, selectLPBalance, selectReservedZCD, selectZCDBalance } from "../utils/features/getAmountsSlice";
  import { addLiquidity, calculateZCD } from "../utils/addLiquidity";
  import {
    getTokensAfterRemove,
    removeLiquidity,
  } from "../utils/removeLiquidity";
  import { getEtherBalanceAddress, getEtherBalanceContract ,getZCDTokensBalance, getLPTokensBalance, getReserveOfZCDTokens} from "../utils/features/getAmountsSlice";


import './liquidity.css'

  
function LiquidityTab () {

/** General state variables */
  // loading is set to true when the transaction is mining and set to false when
  // the transaction has mined
  const [loading, setLoading] = useState(false);
 // This variable is the `0` number in form of a BigNumber
 const zero = BigNumber.from(0);
  const web3Signer = useSelector(selectWeb3Signer);
  const web3Provider = useSelector(selectWeb3Provider);
  
 const dispatch = useDispatch();
  const zcdBalance = useSelector(selectZCDBalance);
  const ethBalance = useSelector(selectEthBalance);
  const lpBalance = useSelector(selectLPBalance);
  const reservedZCD = useSelector(selectReservedZCD);
  const etherBalanceContract = useSelector(selectEthBalanceContract);

  
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




  const getAmounts = async () => {
    try {
      dispatch(getSigner());
      dispatch(getProvider());
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
        dispatch(getSigner());
        const signer = web3Signer;
        setLoading(true);
        // call the addLiquidity function from the utils folder
        await addLiquidity(signer, addZCDTokens, addEtherWei);
        setLoading(false);
        // Reinitialize the ZCD tokens
        setAddZCDTokens(zero);
        // Get amounts for all values after the liquidity has been added
         getAmounts();
        alert('add liquidity: successful');
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
      dispatch(getSigner());
      const signer = web3Signer;
      // Convert the LP tokens entered by the user to a BigNumber
      const removeLPTokensWei = utils.parseEther(removeLPTokens);
      setLoading(true);
      // Call the removeLiquidity function from the `utils` folder
      await removeLiquidity(signer, removeLPTokensWei);
      setLoading(false);
       getAmounts();

      setRemoveZCD(zero);
      setRemoveEther(zero);
      alert("remove liquidity: successful");
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
      dispatch(getProvider());
      const provider = web3Provider;
      // Convert the LP tokens entered by the user to a BigNumber
      const removeLPTokenWei = utils.parseEther(_removeLPTokens);
      // Get the Eth reserves within the exchange contract
      const _ethBalance =  etherBalanceContract;
      // get the crypto dev token reserves from the contract
      const zankoocodeTokenReserve = reservedZCD;
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
                 <div className="addliq-sec">
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
                 <div className="remove-div">
                   {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                   {`You will get ${utils.formatEther(removeZCD)} zankoocode
                  Tokens and ${utils.formatEther(removeEther)} Eth`}
                 </div>
                 <button className="removeLiquidity-btn" onClick={_removeLiquidity}>
                   Remove
                 </button>
               </div>
            
        </div>
       )
}

export default LiquidityTab;