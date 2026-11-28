import { createSlice } from '@reduxjs/toolkit';
import { added, removed } from '../actions/toastActions';

const toastSlice = createSlice({
  name: 'toast',
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(added, (state, action) => {
        state.push(action.payload);
      })
      .addCase(removed, (state, action) =>
        state.filter((toast) => toast.id !== action.payload)
      );
  },
});

export default toastSlice.reducer;
