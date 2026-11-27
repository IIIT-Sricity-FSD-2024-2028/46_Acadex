import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  addAdminDisputeComment,
  addStudentDisputeComment,
  clearDisputeError,
  clearSelectedDispute,
  createOrgSupport,
  createStudentDispute,
  fetchAdminDisputeById,
  fetchAdminDisputes,
  fetchOrgSupport,
  fetchStudentDisputeById,
  fetchStudentDisputeCategories,
  fetchStudentDisputes,
  transitionDispute,
} from '../actions/disputesActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  adminDisputes: createResourceState([]),
  studentDisputes: createResourceState([]),
  orgSupport: createResourceState(null),
  categories: createResourceState([]),
  selected: createResourceState(null),
  saving: false,
  actionError: '',
};

const disputesSlice = createSlice({
  name: 'disputes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(builder, fetchAdminDisputes, (s) => s.adminDisputes);
    bindResourceLifecycle(
      builder,
      fetchStudentDisputes,
      (s) => s.studentDisputes
    );
    bindResourceLifecycle(builder, fetchOrgSupport, (s) => s.orgSupport);
    bindResourceLifecycle(
      builder,
      fetchStudentDisputeCategories,
      (s) => s.categories
    );
    bindResourceLifecycle(builder, fetchAdminDisputeById, (s) => s.selected);
    bindResourceLifecycle(builder, fetchStudentDisputeById, (s) => s.selected, {
      resetOnPending: true,
    });

    const startSaving = (state) => {
      state.saving = true;
      state.actionError = '';
    };
    const failSaving = (state, action) => {
      state.saving = false;
      state.actionError =
        action.payload || action.error?.message || 'Unable to update dispute.';
    };
    const syncDisputeInAdminList = (state, updated) => {
      if (!updated?.id || !Array.isArray(state.adminDisputes.data)) return;
      state.adminDisputes.data = state.adminDisputes.data.map((d) =>
        d.id === updated.id ? { ...d, ...updated } : d
      );
    };

    builder
      .addCase(clearSelectedDispute, (state) => {
        state.selected = createResourceState(null);
        state.actionError = '';
      })
      .addCase(clearDisputeError, (state) => {
        state.actionError = '';
      })

      .addCase(transitionDispute.pending, startSaving)
      .addCase(transitionDispute.fulfilled, (state, action) => {
        state.saving = false;
        state.selected.data = action.payload;
        syncDisputeInAdminList(state, action.payload);
      })
      .addCase(transitionDispute.rejected, failSaving)

      .addCase(addAdminDisputeComment.pending, startSaving)
      .addCase(addAdminDisputeComment.fulfilled, (state, action) => {
        state.saving = false;
        state.selected.data = action.payload;
        syncDisputeInAdminList(state, action.payload);
      })
      .addCase(addAdminDisputeComment.rejected, failSaving)

      .addCase(createStudentDispute.pending, startSaving)
      .addCase(createStudentDispute.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload?.id && Array.isArray(state.studentDisputes.data)) {
          state.studentDisputes.data = [
            action.payload,
            ...state.studentDisputes.data,
          ];
        }
      })
      .addCase(createStudentDispute.rejected, failSaving)

      .addCase(addStudentDisputeComment.pending, startSaving)
      .addCase(addStudentDisputeComment.fulfilled, (state, action) => {
        state.saving = false;
        state.selected.data = action.payload;
      })
      .addCase(addStudentDisputeComment.rejected, failSaving)

      .addCase(createOrgSupport.pending, startSaving)
      .addCase(createOrgSupport.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createOrgSupport.rejected, failSaving)

      .addCase(clearSession, () => initialState);
  },
});

export default disputesSlice.reducer;
