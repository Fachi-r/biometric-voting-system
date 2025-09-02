import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Poll {
  id: number;
  image: string;
  title: string;
  description: string;
  voteCount: number;
  contestantCount: number;
  deleted: boolean;
  director: string;
  startsAt: number;
  endsAt: number;
  createdAt: number;
}

export interface Contestant {
  id: number;
  image: string;
  name: string;
  account: string;
  votes: number;
}

interface PollsState {
  polls: Poll[];
  contestants: { [pollId: number]: Contestant[] };
  isLoading: boolean;
  error: string | null;
}

const initialState: PollsState = {
  polls: [],
  contestants: {},
  isLoading: false,
  error: null,
};

const pollsSlice = createSlice({
  name: 'polls',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPolls: (state, action: PayloadAction<Poll[]>) => {
      state.polls = action.payload;
    },
    addPoll: (state, action: PayloadAction<Poll>) => {
      state.polls.unshift(action.payload);
    },
    updatePoll: (state, action: PayloadAction<Poll>) => {
      const index = state.polls.findIndex(poll => poll.id === action.payload.id);
      if (index !== -1) {
        state.polls[index] = action.payload;
      }
    },
    deletePoll: (state, action: PayloadAction<number>) => {
      state.polls = state.polls.filter(poll => poll.id !== action.payload);
    },
    setContestants: (state, action: PayloadAction<{ pollId: number; contestants: Contestant[] }>) => {
      state.contestants[action.payload.pollId] = action.payload.contestants;
    },
    addContestant: (state, action: PayloadAction<{ pollId: number; contestant: Contestant }>) => {
      if (!state.contestants[action.payload.pollId]) {
        state.contestants[action.payload.pollId] = [];
      }
      state.contestants[action.payload.pollId].push(action.payload.contestant);
    },
    updateVoteCount: (state, action: PayloadAction<{ pollId: number; contestantId: number }>) => {
      const poll = state.polls.find(p => p.id === action.payload.pollId);
      if (poll) {
        poll.voteCount += 1;
      }
      
      const contestants = state.contestants[action.payload.pollId];
      if (contestants) {
        const contestant = contestants.find(c => c.id === action.payload.contestantId);
        if (contestant) {
          contestant.votes += 1;
        }
      }
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

export const {
  setLoading,
  setPolls,
  addPoll,
  updatePoll,
  deletePoll,
  setContestants,
  addContestant,
  updateVoteCount,
  setError,
  clearError,
} = pollsSlice.actions;

export default pollsSlice.reducer;