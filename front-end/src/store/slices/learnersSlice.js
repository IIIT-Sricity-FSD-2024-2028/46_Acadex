import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  clearLearnerDetail,
  createLearner,
  deleteLearner,
  fetchInstructorLearnerById,
  fetchLearners,
  fetchOrgLearnerById,
  fetchOrgLearners,
  fetchStudentProfile,
  updateLearner,
  updateStudentProfile,
} from '../actions/learnersActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  studentProfile: createResourceState(null),
  orgLearners: createResourceState([]),
  orgLearnerDetail: createResourceState(null),
  instructorLearnerDetail: createResourceState(null),
  items: createResourceState([]),
  saving: false,
  actionError: '',
};

const learnersSlice = createSlice({
  name: 'learners',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(
      builder,
      fetchStudentProfile,
      (s) => s.studentProfile
    );
    bindResourceLifecycle(builder, fetchOrgLearners, (s) => s.orgLearners);
    bindResourceLifecycle(
      builder,
      fetchOrgLearnerById,
      (s) => s.orgLearnerDetail,
      { resetOnPending: true }
    );
    bindResourceLifecycle(
      builder,
      fetchInstructorLearnerById,
      (s) => s.instructorLearnerDetail,
      { resetOnPending: true }
    );
    bindResourceLifecycle(builder, fetchLearners, (s) => s.items);

    builder
      .addCase(clearLearnerDetail, (state) => {
        state.orgLearnerDetail = createResourceState(null);
        state.instructorLearnerDetail = createResourceState(null);
      })
      .addCase(updateStudentProfile.pending, (state) => {
        state.saving = true;
        state.actionError = '';
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.studentProfile.data = action.payload;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.saving = false;
        state.actionError =
          action.payload || action.error?.message || 'Unable to save profile.';
      })
      .addCase(createLearner.fulfilled, (state, action) => {
        if (Array.isArray(state.items.data) && action.payload) {
          state.items.data.unshift(action.payload);
        }
      })
      .addCase(updateLearner.fulfilled, (state, action) => {
        if (Array.isArray(state.items.data) && action.payload?.id) {
          state.items.data = state.items.data.map((l) =>
            l.id === action.payload.id ? action.payload : l
          );
        }
      })
      .addCase(deleteLearner.fulfilled, (state, action) => {
        if (Array.isArray(state.items.data)) {
          state.items.data = state.items.data.filter(
            (l) => l.id !== action.payload
          );
        }
      })
      .addCase(clearSession, () => initialState);
  },
});

export default learnersSlice.reducer;
