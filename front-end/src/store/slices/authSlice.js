import { createSlice } from '@reduxjs/toolkit';
import {
  AUTH_STORAGE_KEYS,
  authErrorCleared,
  changePassword,
  clearSession,
  login,
  mirrored,
  register,
  readAuthStorage,
  requestPasswordReset,
  resetPassword,
  storeSession,
} from '../actions/authActions';

const initialState = () => ({
  ...readAuthStorage(),
  loading: false,
  error: '',
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const startPending = (state) => {
      state.loading = true;
      state.error = '';
    };
    const stopFulfilled = (state) => {
      state.loading = false;
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error =
        action.payload || action.error?.message || 'Request failed.';
    };

    builder
      .addCase(mirrored, (state, action) => {
        for (const key of AUTH_STORAGE_KEYS) {
          state[key] = action.payload[key] ?? null;
        }
      })
      .addCase(storeSession, (state, action) => {
        const { values, emptyNullish = false } = action.payload;
        for (const [key, value] of Object.entries(values)) {
          const stringVal = String(emptyNullish ? (value ?? '') : value);
          localStorage.setItem(key, stringVal);
          if (AUTH_STORAGE_KEYS.includes(key)) {
            state[key] = stringVal;
          }
        }
      })
      .addCase(clearSession, (state, action) => {
        const keys = Array.isArray(action.payload)
          ? action.payload
          : AUTH_STORAGE_KEYS;
        keys.forEach((key) => {
          localStorage.removeItem(key);
          if (AUTH_STORAGE_KEYS.includes(key)) {
            state[key] = null;
          }
        });
      })
      .addCase(authErrorCleared, (state) => {
        state.error = '';
      })
      .addCase(login.pending, startPending)
      .addCase(login.fulfilled, stopFulfilled)
      .addCase(login.rejected, handleRejected)
      .addCase(register.pending, startPending)
      .addCase(register.fulfilled, stopFulfilled)
      .addCase(register.rejected, handleRejected)
      .addCase(changePassword.pending, startPending)
      .addCase(changePassword.fulfilled, stopFulfilled)
      .addCase(changePassword.rejected, handleRejected)
      .addCase(requestPasswordReset.pending, startPending)
      .addCase(requestPasswordReset.fulfilled, stopFulfilled)
      .addCase(requestPasswordReset.rejected, handleRejected)
      .addCase(resetPassword.pending, startPending)
      .addCase(resetPassword.fulfilled, stopFulfilled)
      .addCase(resetPassword.rejected, handleRejected);
  },
});

export default authSlice.reducer;
