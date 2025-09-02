import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  biometricAuth: {
    isOpen: boolean;
    role: 'voter' | 'admin' | null;
  };
  createPoll: {
    isOpen: boolean;
  };
  voteConfirmation: {
    isOpen: boolean;
    pollId: number | null;
    contestantId: number | null;
  };
}

const initialState: ModalState = {
  biometricAuth: {
    isOpen: false,
    role: null,
  },
  createPoll: {
    isOpen: false,
  },
  voteConfirmation: {
    isOpen: false,
    pollId: null,
    contestantId: null,
  },
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openBiometricAuth: (state, action: PayloadAction<'voter' | 'admin'>) => {
      state.biometricAuth.isOpen = true;
      state.biometricAuth.role = action.payload;
    },
    closeBiometricAuth: (state) => {
      state.biometricAuth.isOpen = false;
      state.biometricAuth.role = null;
    },
    openCreatePoll: (state) => {
      state.createPoll.isOpen = true;
    },
    closeCreatePoll: (state) => {
      state.createPoll.isOpen = false;
    },
    openVoteConfirmation: (state, action: PayloadAction<{ pollId: number; contestantId: number }>) => {
      state.voteConfirmation.isOpen = true;
      state.voteConfirmation.pollId = action.payload.pollId;
      state.voteConfirmation.contestantId = action.payload.contestantId;
    },
    closeVoteConfirmation: (state) => {
      state.voteConfirmation.isOpen = false;
      state.voteConfirmation.pollId = null;
      state.voteConfirmation.contestantId = null;
    },
  },
});

export const {
  openBiometricAuth,
  closeBiometricAuth,
  openCreatePoll,
  closeCreatePoll,
  openVoteConfirmation,
  closeVoteConfirmation,
} = modalSlice.actions;

export default modalSlice.reducer;