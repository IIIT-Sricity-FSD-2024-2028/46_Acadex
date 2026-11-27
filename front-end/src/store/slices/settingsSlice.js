import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  fetchSettings,
  resetDatabase,
  updateSettings,
} from '../actions/settingsActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  ...createResourceState({}),
  saving: false,
  saveError: '',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(builder, fetchSettings, (s) => s);

    builder
      .addCase(updateSettings.pending, (state) => {
        state.saving = true;
        state.saveError = '';
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.data = { ...(state.data || {}), ...(action.payload || {}) };
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          action.payload ||
          action.error?.message ||
          'Unable to update settings.';
      })
      .addCase(resetDatabase.pending, (state) => {
        state.saving = true;
        state.saveError = '';
      })
      .addCase(resetDatabase.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(resetDatabase.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          action.payload ||
          action.error?.message ||
          'Unable to reset database.';
      })
      .addCase(clearSession, () => initialState);
  },
});

export default settingsSlice.reducer;
