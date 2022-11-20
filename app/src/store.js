import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import walletSlice from './utils/features/walletSlice';
import getAmountsSlice from './utils/features/getAmountsSlice';
import {getDefaultMiddleware} from '@reduxjs/toolkit';


const store = configureStore({
    reducer: {
        wallet: walletSlice,
        getAmounts: getAmountsSlice
    },
    middleware: [
        ...getDefaultMiddleware({
            serializableCheck: false
        }),
        
    ],
})

export default store;