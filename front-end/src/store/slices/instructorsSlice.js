import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  clearSelectedInstructor,
  fetchInstructors,
  fetchInstructorWorkspace,
  fetchOrgInstructorById,
  leaveOrganization,
  updateInstructorStatus,
} from '../actions/instructorsActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  workspace: createResourceState(null),
  items: createResourceState([]),
  selected: createResourceState(null),
  actionLoading: false,
  actionError: '',
};

const instructorsSlice = createSlice({
  name: 'instructors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(
      builder,
      fetchInstructorWorkspace,
      (s) => s.workspace
    );
    bindResourceLifecycle(builder, fetchInstructors, (s) => s.items);
    bindResourceLifecycle(builder, fetchOrgInstructorById, (s) => s.selected, {
      resetOnPending: true,
    });

    builder
      .addCase(clearSelectedInstructor, (state) => {
        state.selected = createResourceState(null);
        state.actionError = '';
      })
      .addCase(updateInstructorStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = '';
      })
      .addCase(updateInstructorStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selected.data = action.payload.detail;
        const updated = action.payload.updated;
        if (Array.isArray(state.items.data) && updated?.id) {
          state.items.data = state.items.data.map((i) =>
            i.id === updated.id ? { ...i, ...updated } : i
          );
        }
      })
      .addCase(updateInstructorStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError =
          action.payload || action.error?.message || 'Unable to update status.';
      })
      .addCase(leaveOrganization.pending, (state) => {
        state.actionLoading = true;
        state.actionError = '';
      })
      .addCase(leaveOrganization.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(leaveOrganization.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError =
          action.payload || action.error?.message || 'Action failed.';
      })
      .addCase(clearSession, () => initialState);
  },
});

export default instructorsSlice.reducer;
