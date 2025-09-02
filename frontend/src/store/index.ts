import { configureStore } from '@reduxjs/toolkit';
import walletSlice from './slices/walletSlice';
import pollsSlice from './slices/pollsSlice';
import modalSlice from './slices/modalSlice';
import transactionSlice from './slices/transactionSlice';

export const store = configureStore({
  reducer: {
    wallet: walletSlice,
    polls: pollsSlice,
    modal: modalSlice,
    transaction: transactionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['wallet/setProvider', 'wallet/setSigner'],
        ignoredPaths: ['wallet.provider', 'wallet.signer'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;