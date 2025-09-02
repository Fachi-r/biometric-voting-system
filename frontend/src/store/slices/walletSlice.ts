import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  provider: any;
  signer: any;
  isLoading: boolean;
  error: string | null;
  account: string | null;
  isAdmin: boolean;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  balance: null,
  provider: null,
  signer: null,
  isLoading: false,
  error: null,
  account: null,
  isAdmin: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    connectWallet: (state, action: PayloadAction<{ address: string; balance: string; provider: any; signer: any; account: string; isAdmin: boolean }>) => {
      state.isConnected = true;
      state.address = action.payload.address;
      state.balance = action.payload.balance;
      state.provider = action.payload.provider;
      state.signer = action.payload.signer;
      state.account = action.payload.account;
      state.isAdmin = action.payload.isAdmin;
      state.error = null;
    },
    disconnectWallet: (state) => {
      state.isConnected = false;
      state.address = null;
      state.balance = null;
      state.provider = null;
      state.signer = null;
      state.account = null;
      state.isAdmin = false;
    },
    updateBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, connectWallet, disconnectWallet, updateBalance, setError, clearError } = walletSlice.actions;
export default walletSlice.reducer;