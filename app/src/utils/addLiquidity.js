import { Contract, utils, BigNumber } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

/**
 * addLiquidity helps add liquidity to the exchange,
 * If the user is adding initial liquidity, user decides the ether and ZCD tokens he wants to add
 * to the exchange. If he is adding the liquidity after the initial liquidity has already been added
 * then we calculate the  zankoocode tokens he can add, given the Eth he wants to add by keeping the ratios
 * constant
 */

/*export const approve = async (signer, addZCDAmount) => {
  /
}*/

export const addLiquidity = async (
  signer,
  addZCDAmount,
  addEtherAmountWei
) => {
  try {
    //create a new instance of the token contract
  const tokenContract = new Contract(
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    signer
  );
  // Because ZCD tokens are an ERC20, user would need to give the contract allowance
    // to take the required number ZCD tokens out of his contract
    let tx = await tokenContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      BigNumber.from(utils.parseEther(addZCDAmount.toString()))
      
    );
    await tx.wait();
    // create a new instance of the exchange contract
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      signer
    );
    
    // After the contract has the approval, add the ether and zcd tokens in the liquidity
   tx = await exchangeContract.addLiquidity(addZCDAmount, {
      value: addEtherAmountWei, 
      gasLimit: 100000
    });
    await tx.wait();
  } catch (err) {
    console.error(err);
  }
};



/**
 * calculateZCD calculates the ZCD tokens that need to be added to the liquidity
 * given `_addEtherAmountWei` amount of ether
 */
export const calculateZCD = async (
  _addEther = "0",
  etherBalanceContract,
  zcdTokenReserve
) => {
  // `_addEther` is a string, we need to convert it to a Bignumber before we can do our calculations
  // We do that using the `parseEther` function from `ethers.js`
  const _addEtherAmountWei = utils.parseEther(_addEther);

  // Ratio needs to be maintained when we add liquidty.
  // We need to let the user know for a specific amount of ether how many `ZCD` tokens
  // He can add so that the price impact is not large
  // The ratio we follow is (amount of zankoocode tokens to be added) / (zankoocode tokens balance) = (Eth that would be added) / (Eth reserve in the contract)
  // So by maths we get (amount of zankoocode tokens to be added) = (Eth that would be added * zankoocode tokens balance) / (Eth reserve in the contract)

  const zankoocodeTokenAmount = _addEtherAmountWei
    .mul(zcdTokenReserve)
    .div(etherBalanceContract);
  return zankoocodeTokenAmount;
};