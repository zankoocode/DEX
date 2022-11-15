# zankoocode-DEX
zankoocode Decentralized exchange
## How to use?
you can simply go to the following link and use the DEX on the Goerli network.
// https://dex-tau-eosin.vercel.app

<img width="1272" alt="Screenshot 2022-11-15 at 11 37 16 PM" src="https://user-images.githubusercontent.com/102598239/202015462-7c7b6b7f-4b04-4d46-947e-163e68dfa030.png">

## How it works?
the DEX is following the popular standard of Uniswap V1 which is ((x * y) = k).
x and y are out trading pairs and k is a constant, assume ETH/ZCD, where:
x = reserve of ETH in the trading pool
y = reserve of ZCD in the trading pool
k = a constant

This simple formula is responsible for calculating prices, deciding how much ETH would be received in exchange for a certain amount of ZCD, or vice versa.

##### It doesn't matter if we use x to represent the reserve of ETH or ZCD Token as long as y represents the opposite.

The formula states that k is a constant no matter what the reserves (x and y) are. Every swap made increases the reserve of either ETH or ZCD Token and decreases the reserve of the other.

Lets make it more explicit by this formula:
(x + x′) * (y - y′) = k
where x′ is the amount of token provided for sale and y′ is the amount of token that the trader would recieve. but how we calculate y′?
with this equation: y′ = (y * x′) / (x + x′).

##### Assume we have 10 ETH and 20 ZCD Token in the contract.
What would happen if I want to swap 0.1 ETH for ZCD Tokens?
inputAmount = 0.1 ETH inputReserve = 10 ETH outputReserve = 20 ZCD Tokens
=> outputAmount = 0.198019802 ZCD Tokens.

### How price is set?
first, when the trading pool is empty, the first person how provide liquidity will set the price, but when it is not empty, it will proportional to the amount that is currently in the pool and after the first time the pool will never be completely empty according to the formula.

![Lo9CAct](https://user-images.githubusercontent.com/102598239/202021730-943d6085-2a1e-4f12-998a-85970dd17cdc.png)


#### LP token 
the LP token is like a proof and a way to reward liquidity providers.
the amount of LP token that liquidity provider will recieve is proportional to the amount of ETH provided by them. when a new person provide liquidity, new LP tokens will be minted and when the person removes the liquidity, with the amount specified LP tokens that he/she owned will be burned.
### fees
in order to reward the liquidity providers, we need to gain slight fees in swaps, which this DEX is currently gaining 1% on each swap which will be in x′.

