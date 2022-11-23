import React, {useEffect, useState } from "react";
import { BigNumber, utils } from "ethers";
 import { calculateZCD } from "../utils/addLiquidity";


import './liquidity.css'
import { useBalance, useContractRead, useAccount, useSigner, useProvider, useContractWrite, usePrepareContractWrite } from "wagmi";

import {TOKEN_CONTRACT_ABI,
         TOKEN_CONTRACT_ADDRESS,
           EXCHANGE_CONTRACT_ABI,
            EXCHANGE_CONTRACT_ADDRESS} from '../constants/index';
import { providers } from 'ethers';
import { parse } from "@ethersproject/transactions";
//import {providers} from 'ethers'
  
function LiquidityTab () {

/** General state variables */
  // loading is set to true when the transaction is mining and set to false when
  // the transaction has mined
  const [loading, setLoading] = useState(false);
 // This variable is the `0` number in form of a BigNumber
 const zero = BigNumber.from(0);
  const web3Signer = useSigner();
  const web3Provider = useProvider();


  const account = useAccount();
  /** Variables to keep track of liquidity to be added or removed */
  // addEther is the amount of Ether that the user wants to add to the liquidity
  const [addEther, setAddEther] = useState(zero);
  // addZCDTokens keeps track of the amount of ZCD tokens that the user wants to add to the liquidity
  // in case when there is no initial liquidity and after liquidity gets added it keeps track of the
  // CD tokens that the user can add given a certain amount of ether
  const [addZCDTokens, setAddZCDTokens] = useState(zero);
  
  const [removeEtherAmount, setRemoveEtherAmount] = useState(zero);
  const [removeZCDAmount, setRemoveZCDAmount] = useState(zero);
  const [LPTotalSupply, setLPTotalSupply] = useState(zero);
  // border colors based the input 
  const [colorBorderLP, setColorBorderLP] = useState("");
  const [colorBorderEther, setcolorBorderEther] = useState("");
  const [colorBorderZCD, setColorBorderZCD] = useState("");
  const [colorBorderEth, setColorBorderEth] = useState("");

  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
  const [etherBalanceUser, setEtherBalanceUser] = useState(zero);
  const [tokenBalanceUser, setTokenBalanceUser] = useState(zero);
  const [lpBalanceUser, setLPBalanceUser] = useState(zero);
  const [reservedZCD, setReservedZCD] = useState(zero);

  const [_addZCDAmount, _setAddZCDAmount] = useState(zero);
  const [_addEtherWei, _setAddEtherWei ] = useState(zero);

  const [_removeLPTokensWei, _setRemoveLPTokensWei] = useState(zero);

  const getEtherBalanceUser = useBalance({
    address: account.address,
    onSuccess(data) {
      console.log(data)
      setEtherBalanceUser(data)
    }
  })

  const getEtherBalanceContract = useBalance({
    address: EXCHANGE_CONTRACT_ADDRESS,
    onSuccess(data) {
      setEtherBalanceContract(data)
      console.log(data.formatted)
    }
  })

  const tokenContractRead = useContractRead({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [account.address],
    onSuccess(data){
      setTokenBalanceUser(data);
    }
  });

  const LPexchangeContractRead = useContractRead({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [account.address],
    onSuccess(data){
      setLPBalanceUser(data)
    }
  });

  const reserveZCDexchange = useContractRead({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_CONTRACT_ABI,
    functionName: 'getReserve',
    onSuccess(data) {
      setReservedZCD(data)
    }
  });


  
  

  /**** ADD LIQUIDITY FUNCTIONS ****/

  /**
   
   */

    const { write: approveToken, isSuccess: isSuccessApprove} = useContractWrite({
        address: TOKEN_CONTRACT_ADDRESS,
        abi: TOKEN_CONTRACT_ABI,
        functionName: 'approve',
        args: [EXCHANGE_CONTRACT_ADDRESS, addZCDTokens]
    });
   
    const {write: addLiquidity, isLoading: isLoadingAddLiquidity} = useContractWrite({
      address: EXCHANGE_CONTRACT_ADDRESS,
      abi: EXCHANGE_CONTRACT_ABI,
      functionName: 'addLiquidity',
      args: [addZCDTokens],
      overrides: {
        from: account.address,
        value: _addEtherWei,
      },
    });
   
  


  /**** REMOVE LIQUIDITY FUNCTIONS ****/

  /**
   * _removeLiquidity: Removes the `removeLPTokensWei` amount of LP tokens from
   * liquidity and also the calculated amount of `ether` and `ZCD` tokens
   */
  const { write: removeLiquidity, 
          isLoading: isLoadingRemoveLiquidity} = useContractWrite({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_CONTRACT_ABI,
    functionName: 'removeLiquidity',
    args: [_removeLPTokensWei],
    overrides: {
      gasLimit: 80000,
      
    },
    
    
  })




  const getTokensAfterRemove = async (_removeLPTokensWei) => {
    
  
  const _removeEther = etherBalanceContract.value.mul(_removeLPTokensWei).div(LPTotalSupply);
      const _removeZCD = reservedZCD
    .mul(_removeLPTokensWei)
    .div(LPTotalSupply);
      setRemoveEtherAmount(_removeEther);
      setRemoveZCDAmount(_removeZCD);
}
  const getLPTotalSupply = useContractRead({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_CONTRACT_ABI,
    functionName: 'totalSupply',
    onSuccess(data) {
    setLPTotalSupply(data)
      console.log(data)
  }
  })

  
  /**
   * _getTokensAfterRemove: Calculates the amount of `Ether` and `ZCD` tokens
   * that would be returned back to user after he removes `removeLPTokenWei` amount
   * of LP tokens from the contract
   */
  


    if (isLoadingRemoveLiquidity || isLoadingAddLiquidity) {
        return (
          <div className="loading-time-sec">
        <button className="loading">Waiting...</button>
        </div>
        )
      } 
    
    return (
        <div className="App">
          
        { <div className="description">
           You have {utils.formatEther(tokenBalanceUser)} zankoocode tokens 
           <br />
           You have {etherBalanceUser.formatted} Ether
           <br />
           You have {utils.formatEther(lpBalanceUser)} zankoocode LP tokens
         </div>
    }
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
                         if (e.target.value > utils.formatEther(etherBalanceUser)){
                           setcolorBorderEther("1.5px solid red")
                           
                         } else {
                           setcolorBorderEther("1.5px solid green")
                           setAddEther(e.target.value || "0")
                           _setAddEtherWei(utils.parseEther(e.target.value.toString()));
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
                         if (e.target.value > utils.formatEther(tokenBalanceUser)){
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
                   {
                    isSuccessApprove ? <><button className="addLiquidity-approve-btn" onClick={addLiquidity}>
                    Add
                   </button>  <span className="tx-num">
                    2/2
                   </span>
                   </>
                   :
                    <><button className="addLiquidity-approve-btn" onClick={approveToken}>
                    Approve
                  </button>
                  <span className="tx-num">
                    1/2
                  </span>
                  </>
                   }
                   
                 </div>
                 
               ) : (
                 <div className="addliq-sec">
                   <input
                     type="number"
                     placeholder="Amount of Ether"
                     style={{border: colorBorderEth}}
                     onChange={
                       async (e) => {
                         if (e.target.value > etherBalanceUser.formatted) {
                           setColorBorderEth("1.5px solid red");
                         } else {
                           setColorBorderEth("1.5px solid green");
                       setAddEther(e.target.value || "0");
                       _setAddEtherWei(utils.parseEther(e.target.value))
                       // calculate the number of ZCD tokens that
                       // can be added given  `e.target.value` amount of Eth
                       const _addZCDTokens = await calculateZCD(
                         e.target.value || "0",
                         etherBalanceContract.value,
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
                   {
                    isSuccessApprove ? <><button className="addLiquidity-approve-btn" onClick={addLiquidity}>
                    Add
                   </button>  <span className="tx-num">
                    2/2
                   </span>
                   </>
                   :
                    <><button className="addLiquidity-approve-btn" onClick={approveToken}>
                    Approve
                  </button>
                  <span className="tx-num">
                    1/2
                  </span>
                  </>
                   }
                   
                 </div>
               )}
                 <div className="remove-liquidity-sec">
                 <input
                   type="number"
                   placeholder="Amount of LP Tokens"
                   style={{border: colorBorderLP}}
                   onChange={async (e) => {
   
                     if (e.target.value > utils.formatEther(lpBalanceUser)){
                         setColorBorderLP("1.5px solid red");
                     } else {
                       setColorBorderLP("1.5px solid green");
                       // Calculate the amount of Ether and CD tokens that the user would receive
                       // After he removes `e.target.value` amount of `LP` tokens
                       //setRemoveLPTokensAmount(e.target.value);
                       _setRemoveLPTokensWei(utils.parseEther(e.target.value));
                       getTokensAfterRemove(utils.parseEther(e.target.value));
                       
                     }
                     
                   }}
                   className="lp-tokens-input"
                 />
                 <div className="remove-div">
                 
                   {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                   {`You will get ${utils.formatEther(removeZCDAmount)} zankoocode
                  Tokens and ${utils.formatEther(removeEtherAmount)} Eth`}
                 </div>
                 <button className="removeLiquidity-btn" onClick={removeLiquidity}>
                   Remove
                 </button>
               </div>
            
        </div>
       )
}

export default LiquidityTab;