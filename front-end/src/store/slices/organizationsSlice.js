import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  fetchInstitutions,
  fetchOrgProfile,
  fetchOrgStats,
  syncOrgCounts,
  updateOrgProfile,
  verifyInstitution,
} from '../actions/organizationsActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  profile: createResourceState(null),
  stats: createResourceState(null),
  institutions: createResourceState([]),
  saving: false,
  error: '',
};

const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(builder, fetchOrgProfile, (s) => s.profile);
    bindResourceLifecycle(builder, fetchOrgStats, (s) => s.stats);
    bindResourceLifecycle(builder, fetchInstitutions, (s) => s.institutions);

    builder
      .addCase(updateOrgProfile.pending, (state) => {
        state.saving = true;
        state.error = '';
      })
      .addCase(updateOrgProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.profile.data = {
          ...(state.profile.data || {}),
          ...(action.payload || {}),
        };
      })
      .addCase(updateOrgProfile.rejected, (state, action) => {
        state.saving = false;
        state.error =
          action.payload || action.error?.message || 'Update failed.';
      })
      .addCase(syncOrgCounts.fulfilled, (state, action) => {
        if (action.payload) {
          state.profile.data = action.payload;
        }
      })
      .addCase(verifyInstitution.fulfilled, (state, action) => {
        if (Array.isArray(state.institutions.data) && action.payload?.id) {
          state.institutions.data = state.institutions.data.map((inst) =>
            inst.id === action.payload.id ? action.payload : inst
          );
        }
      })
      .addCase(clearSession, () => initialState);
  },
});

export default organizationsSlice.reducer;
