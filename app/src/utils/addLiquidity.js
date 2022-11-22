import { utils } from "ethers";


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