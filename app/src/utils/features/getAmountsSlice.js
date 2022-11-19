
 
  import { BigNumber } from "ethers";
  import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
  import { Contract } from "ethers";
    import {  EXCHANGE_CONTRACT_ABI,
                EXCHANGE_CONTRACT_ADDRESS,
                TOKEN_CONTRACT_ABI,
                TOKEN_CONTRACT_ADDRESS } from "../../constants/index";
import { getProviderOrSigner } from "./walletSlice";

  const zero = BigNumber.from(0);



  // get Ether balance of the user
  export const getEtherBalanceAddress = createAsyncThunk(
    'getAmounts/getEtherBalanceAddress',
    async ({provider, address}, thunkAPI) => {    
        const balance = await provider.getBalance(address);
        return balance;
    }
  );
  // get Ether balance of the contract
  export const getEtherBalanceContract = createAsyncThunk(
    'getAmounts/getEtherBalanceContract',
    async (provider, thunkAPI) => {
        const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
        return balance;
    }
  )


    /**
         * getCDTokensBalance: Retrieves the zankoocode tokens in the account
        * of the provided `address`
    */
  export const getZCDTokensBalance = createAsyncThunk(
    'getAmounts/getZCDTokensBalance',
    async ({provider, address}, thunkAPI) => {
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            provider
          );
          const balancezankoocodeTokens = await tokenContract.balanceOf(address);
          return balancezankoocodeTokens;
    }
  );

  /**
    * getLPTokensBalance: Retrieves the amount of LP tokens in the account
    * of the provided `address`
 */
  export const getLPTokensBalance = createAsyncThunk(
    'getAmount/getLPTokensBalance',
    async ({provider, address}, thunkAPI) => {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
          );
          const balanceOfLPTokens = await exchangeContract.balanceOf(address);
          return balanceOfLPTokens;
    } 
  )

  /**
     * getReserveOfCDTokens: Retrieves the amount of ZCD tokens in the
     * exchange contract address
  */
  export const getReserveOfZCDTokens = createAsyncThunk(
    'getAmounts/getReserveOfZCDTokens',
    async(provider, thunkAPI) => {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
          );
          const reserve = await exchangeContract.getReserve();
          return reserve;
    }
  );

  export const getAmounts = createAsyncThunk(
    'getAmounts/getAmounts',
    async() => {
        const provider = getProviderOrSigner(false)
        const signer = getProviderOrSigner(true)
        const address = await signer.getAddress();
         getEtherBalanceAddress({provider: provider, address: address});
        getEtherBalanceContract(provider);
        getZCDTokensBalance({provider: provider, address: address});
        getLPTokensBalance({provider: provider, address: address});
        getReserveOfZCDTokens(provider);
    }
  )

  const getAmountsSlice = createSlice({
    name: 'getAmounts',
    initialState: {
        ethBalance: zero,
        reservedZCD: zero,
        etherBalanceContract: zero,
        zcdBalance: zero,
        lpBalance: zero,
        fetchBalances: null
    }, 
    reducers: {

    },
    extraReducers: {
        [getEtherBalanceAddress.fulfilled] : (state, action) => {
            state.ethBalance = action.payload;
        },
        [getEtherBalanceAddress.rejected] : (state, action) => {
            state.ethBalance = zero;
            state.fetchBalances = "fetch Ether balance failed";
        },
        [getEtherBalanceContract.fulfilled] : (state, action) => {
            state.etherBalanceContract = action.payload;
        },
        [getEtherBalanceContract.rejected] : (state, action) => {
            state.etherBalanceContract = zero;
            state.fetchBalances = "fetch Ether balance failed";
        },
        [getZCDTokensBalance.fulfilled] : (state, action) => {
            state.zcdBalance = action.payload;
        },
        [getZCDTokensBalance.rejected] : (state, action) => {
            state.zcdBalance = zero;
            state.fetchBalances = "fetch ZCD balance failed";
        },
        [getLPTokensBalance.fulfilled] : (state, action) => {
            state.lpBalance = action.payload;
        },
        [getLPTokensBalance.rejected] : (state, action) => {
            state.lpBalance = zero;
            state.fetchBalances = "fetch LP balance failed";
        }
    }
  });


  export const selectEthBalance = state => state.ethBalance;
  export const selectEthBalanceContract = state => state.etherBalanceContract;
  export const selectZCDBalance = state => state.zcdBalance;
  export const selectLPBalance = state => state.lpBalance;
  export const selectReservedZCD = state => state.reservedZCD;
  export const selectFetchBalances = state => state.fetchBalances;

  export default getAmountsSlice.reducer;
