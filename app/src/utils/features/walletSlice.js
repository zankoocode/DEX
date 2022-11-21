import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { providers } from 'ethers'
import Web3Modal from "web3modal";




export const getProvider = createAsyncThunk(
    'wallet/getProvider',
    async () => {
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
    return web3Provider
    }
)
export const getSigner = createAsyncThunk(
    'wallet/getSigner',
    async () => {
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
    const signer = web3Provider.getSigner();
      return signer;
    }
    
)

export const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        walletConnected: false,
        web3Provider: null,
        web3Signer: null,
        
    },
    reducers: {
        
    },
    extraReducers: {
        [getProvider.fulfilled] : (state, action) => {
            state.web3Provider = action.payload;
            state.walletConnected = true;

        },
        [getProvider.rejected] : (state, action) => {
            state.web3Provider = null;
                console.log('error happened')
        },
        [getSigner.fulfilled] : (state, action) => {
            state.web3Signer = action.payload;
            state.walletConnected = true;
        },
        [getSigner.rejected] : (state, action) => {
            state.web3Signer = null;
            console.log('error happened')
        }
    }
})



export const selectWalletConnected = state => state.wallet.walletConnected;

export const selectWeb3Provider = state => state.wallet.web3Provider;

export const selectWeb3Signer = state => state.wallet.web3Signer;





export default walletSlice.reducer;