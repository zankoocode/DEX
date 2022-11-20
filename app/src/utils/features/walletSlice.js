import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { providers } from 'ethers'
import Web3Modal from "web3modal";
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
export const getProviderOrSigner = createAsyncThunk(
    'wallet/getProviderOrSigner',
    async (needSigner = false, thunkAPI) => {
        const web3modal = new Web3Modal({
            network: "goerli",
            providerOptions: {},
            disableInjectedProvider: false
        });

        
        // Connect to Metamask
         // Since we store `web3Modal` as a state, we need to access the value to get access to the underlying object
    const provider = await web3modal.connect();
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
    } else {
    return web3Provider;
    }
    }
);
export const connectWallet = createAsyncThunk(
    'wallet/walletConnect',
    async (arg, thunkAPI) => {
         getProviderOrSigner();
    }
)

export const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        walletConnected: false,
        web3Modal: null,
        web3ProviderOrSigner: null,
        walletConnectFail: false
    },
    reducers: {
        web3Connect: (state, action) => {
            state.web3Modal = new Web3Modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false
            });
            console.log(state.web3Modal)
        }
    },
    extraReducers: {
        [getProviderOrSigner.fulfilled] : (state, action) => {
            state.web3ProviderOrSigner = action.payload;
            state.walletConnected = true;
            console.log(state.web3ProviderOrSigner);
            console.log(state.walletConnected)
        },
        [getProviderOrSigner.rejected] : (state, action) => {
            state.web3ProviderOrSigner = null;
                console.log('errrr')
        },
        [connectWallet.fulfilled] : (state, action) => {
            state.walletConnectFail = false;
            state.walletConnected = true;
        },
        [connectWallet.rejected] : (state, action) => {
            state.walletConnectFail = true;
            state.walletConnected = false;
        },
    }
})



//const selectWeb3Modal = state => state.web3Modal;
export const selectWalletConnected = state => state.walletConnected;
export const selectWeb3ProviderOrSigner = state => state.web3ProviderOrSigner;
export const selectWalletConnectFail = state => state.walletConnectFail;
export const { web3Connect } = walletSlice.actions;



export default walletSlice.reducer;