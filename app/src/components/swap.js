import { BigNumber, utils } from "ethers";
import React, { useState } from "react";
import { useAccount, useBalance, useContractRead, useContractWrite } from "wagmi";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from "../constants";




 import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap";
 import './swap.css';

function SwapTab () {

  const zero = BigNumber.from(0);
      /** General state variables */
  // loading is set to true when the transaction is mining and set to false when
  // the transaction has mined
  const [loading, setLoading] = useState(false);

  const [reservedZCD, setReservedZCD] = useState(zero);

  const [etherBalanceContract, setEtherBalanceContract] = useState(zero) ;

  const [etherBalanceUser, setEtherBalanceUser] = useState(zero);

  const [approveTokenAmount, setApproveTokenAmount] = useState(zero);
  const [ swapAmountWei, setSwapAmountWei] = useState(zero);
  // This variable is the `0` number in form of a BigNumber
 
 
  /** Variables to keep track of swap functionality */
  // Amount that the user wants to swap
  const [swapAmount, setSwapAmount] = useState("");
  // This keeps track of the number of tokens that the user would receive after a swap completes
  const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] =
    useState(zero);
  // Keeps track of whether  `Eth` or `zankoocode` token is selected. If `Eth` is selected it means that the user
  // wants to swap some `Eth` for some `zankoocode` tokens and vice versa if `Eth` is not selected
  const [ethSelected, setEthSelected] = useState(true);


  const account = useAccount();
 
 
  const getEtherBalanceUser = useBalance({
    address: account.address,
    onSuccess(data) {
      console.log(data)
      setEtherBalanceUser(data)
    }
  })
  
  const reserveZCDexchange = useContractRead({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_CONTRACT_ABI,
    functionName: 'getReserve',
    onSuccess(data) {
      setReservedZCD(data)
    }
  });

    const getEtherBalanceContract = useBalance({
      address: EXCHANGE_CONTRACT_ADDRESS,
      onSuccess(data){
        setEtherBalanceContract(data)
      }
    })
  const {refetch: getAmountsAfterSwapEther} = useContractRead({
      address: EXCHANGE_CONTRACT_ADDRESS,
      abi: EXCHANGE_CONTRACT_ABI,
      functionName: 'getAmountOfTokens',
      args: [swapAmountWei, etherBalanceContract.value, reservedZCD],
      onSuccess(data){
        console.log(data)
        settokenToBeReceivedAfterSwap(data)
      },
      enabled: false
  });

  const {refetch: getAmountsAfterSwapZCD} = useContractRead({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_CONTRACT_ABI,
    functionName: 'getAmountOfTokens',
    args: [swapAmountWei, reservedZCD, etherBalanceContract.value],
    onSuccess(data){
      settokenToBeReceivedAfterSwap(data)
    },
    enabled: false
  })

  const {write: approveToken, isSuccess: isSuccessApproveToken} = useContractWrite({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_CONTRACT_ABI,
    functionName: 'approve',
    args: [EXCHANGE_CONTRACT_ADDRESS, swapAmountWei]
  })

 const { write: swapZankoocodeTokenToEth, isLoading: isLoadingSwapZankoocodeTokenToEth} = useContractWrite({
  address: EXCHANGE_CONTRACT_ADDRESS,
  abi: EXCHANGE_CONTRACT_ABI,
  functionName: 'zankoocodeTokenToEth',
  args: [swapAmountWei, tokenToBeReceivedAfterSwap],
  overrides: {
    gasLimit: 80000
  }
 })
  const {write: swapEthTozankoocodeToken, isLoading: isLoadingSwapEthTozankoocodeToken} = useContractWrite({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_CONTRACT_ABI,
    functionName: 'ethTozankoocodeToken',
    args: [tokenToBeReceivedAfterSwap],
    overrides: {
      value: swapAmountWei,
      gasLimit: 80000
    },
    onSettled(){
      alert('swap was successful')
    }

  })
  
  /*** END ***/


  if (isLoadingSwapEthTozankoocodeToken || isLoadingSwapZankoocodeTokenToEth) {
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
          
          // Calculate the amount of tokens user would receive after the swap
          if (ethSelected){
          
          await setSwapAmountWei(utils.parseEther(e.target.value ) || "");
         await getAmountsAfterSwapEther();
          
        } else if (!ethSelected){
          
          await setSwapAmountWei(BigNumber.from(utils.parseEther(e.target.value || "0")))
          
          await getAmountsAfterSwapZCD();
          
        }
        }}
        className="swap-input"
        
      />
      <select
        className="token-select"
        name="dropdown"
        id="dropdown"
        onChange={async () => {
          setEthSelected(!ethSelected);
          // Initialize the values back to zero
          //setApproveTokenAmount(BigNumber.from(utils.parseEther( swapAmountWei.toString())));
        
          setSwapAmountWei("");
        }}
      >
        <option value="eth">Ethereum</option>
        <option value="zankoocodeToken">zankoocode Token</option>
      </select>
      <br />
      <div className="input-div">
        {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
        {ethSelected
          ? 
          <div className="swap-sec">
          You will get { utils.formatEther(tokenToBeReceivedAfterSwap._hex) } zankoocode Tokens
            <button className="swap-button" onClick={swapEthTozankoocodeToken} disabled={swapAmountWei==0}>
             Swap
            </button>
            </div>
          : 
          <div className="swap-sec">
            <p>
               You will get: <br/> { utils.formatEther(tokenToBeReceivedAfterSwap._hex) } Eth </p>
              {isSuccessApproveToken ? 
              <>
                <button className="swap-button-sec" onClick={swapZankoocodeTokenToEth} disabled={swapAmountWei == 0}>
                  Swap
                </button>
                <span className="tx-num2">
                2/2
               </span>
               </>
                 :
                 <div className="swap-sec">
                        <button className="approve-button" onClick={approveToken} disabled={swapAmountWei == 0}>
                       Approve
                       </button>
                       <span className="tx-num2">
                       1/2
                      </span>
                      </div>
              }
              
              </div>
                }
      </div>
      

      <div className="image-div" >
            <img src="https://ipfs.io/ipfs/QmPu2y3gdiB5agUkiBBL15TFBHTtKMy6wP4TNuALdcYhkm"/>
            </div>

            made by @zankoocode
    </div>
  );
}



export default SwapTab;