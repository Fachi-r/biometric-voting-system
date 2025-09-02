import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Transaction {
  hash: string;
  type: 'create_poll' | 'update_poll' | 'delete_poll' | 'vote' | 'contest';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  currentTx: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  currentTx: null,
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCurrentTx: (state, action: PayloadAction<string | null>) => {
      state.currentTx = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Omit<Transaction, 'timestamp'>>) => {
      const transaction: Transaction = {
        ...action.payload,
        timestamp: Date.now(),
      };
      state.transactions.unshift(transaction);
    },
    updateTransactionStatus: (state, action: PayloadAction<{ hash: string; status: Transaction['status'] }>) => {
      const transaction = state.transactions.find(tx => tx.hash === action.payload.hash);
      if (transaction) {
        transaction.status = action.payload.status;
      }
    },
    clearTransactions: (state) => {
      state.transactions = [];
    },
  },
});

export const {
  setLoading,
  setCurrentTx,
  addTransaction,
  updateTransactionStatus,
  clearTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;