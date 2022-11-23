import { BigNumber, utils } from "ethers";
import React, { useState } from "react";
import { useAccount, useBalance, useContractRead, useContractWrite } from "wagmi";
import { EXCHANGE_CONTRACT_ABI,
         EXCHANGE_CONTRACT_ADDRESS, 
         TOKEN_CONTRACT_ABI,
          TOKEN_CONTRACT_ADDRESS } from "../constants";





 import './swap.css';

function SwapTab () {

  const zero = BigNumber.from(0);

      /** General state variables */
  

  const [reservedZCD, setReservedZCD] = useState(zero);

  const [etherBalanceContract, setEtherBalanceContract] = useState(zero) ;

  const [etherBalanceUser, setEtherBalanceUser] = useState(zero);

 
  const [ swapAmountWei, setSwapAmountWei] = useState(zero);
  // This variable is the `0` number in form of a BigNumber
 
 
  
  // This keeps track of the number of tokens that the user would receive after a swap completes
  const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] =
    useState(zero);

  // Keeps track of whether  `Eth` or `zankoocode` token is selected. If `Eth` is selected it means that the user
  // wants to swap some `Eth` for some `zankoocode` tokens and vice versa if `Eth` is not selected
  const [ethSelected, setEthSelected] = useState(true);


  // the account of the user
  const account = useAccount();
 
  // getEtherBalanceUser will get the amount of ether of the user
  const getEtherBalanceUser = useBalance({
    address: account.address,
    onSuccess(data) {
      
      setEtherBalanceUser(data)
    }
  })

  // reserveZCDexchange will get the reserve amount of ZCD in the contract
  const reserveZCDexchange = useContractRead({
    address: EXCHANGE_CONTRACT_ADDRESS,
    abi: EXCHANGE_CONTRACT_ABI,
    functionName: 'getReserve',
    onSuccess(data) {
      setReservedZCD(data)
    }
  });

  // getEtherBalanceContract will get the ether balance of the contract
    const getEtherBalanceContract = useBalance({
      address: EXCHANGE_CONTRACT_ADDRESS,
      onSuccess(data){
        setEtherBalanceContract(data)
      }
    })


    // getAmountsAfterSwapEther will call a function in the contract that calculate the amount of token after swap
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

  // getAmountsAfterSwapZCD will call a function in the contract that calculate the amount of token after swap
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

  // for swapping ZCD the amount of token first should be approved which approveToken function does it
  const {write: approveToken, isSuccess: isSuccessApproveToken} = useContractWrite({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_CONTRACT_ABI,
    functionName: 'approve',
    args: [EXCHANGE_CONTRACT_ADDRESS, swapAmountWei]
  })

  // after approvde token swapZankoocodeTokenToEth will be invoked with swap ZCD into Eth
 const { write: swapZankoocodeTokenToEth, isLoading: isLoadingSwapZankoocodeTokenToEth} = useContractWrite({
  address: EXCHANGE_CONTRACT_ADDRESS,
  abi: EXCHANGE_CONTRACT_ABI,
  functionName: 'zankoocodeTokenToEth',
  args: [swapAmountWei, tokenToBeReceivedAfterSwap],
  overrides: {
    gasLimit: 80000
  }
 })

 // swapEthTozankoocodeToken function will swap eth (in wei) into ZCD token
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
          
          setSwapAmountWei("");
        }}
      >
        <option value="eth">Ethereum</option>
        <option value="zankoocodeToken">zankoocode Token</option>
      </select>
      <br />
      <div className="input-div">
     
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