import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  clearAdminSession,
  clearSelectedAccount,
  clearUsersActionError,
  deleteAccount,
  fetchAccountById,
  fetchAccounts,
  fetchAdminSession,
  fetchWorkspaceAccount,
  fetchWorkspaceSession,
  toggleAccountAccess,
  updateAdminProfile,
  updateWorkspaceAccount,
  verifyOrganizationAccount,
} from '../actions/usersActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  adminSession: createResourceState(null),
  workspaceSession: createResourceState(null),
  workspaceAccount: createResourceState(null),
  directory: createResourceState({ items: [], counts: {} }),
  selectedAccount: createResourceState(null),
  saving: false,
  actionError: '',
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(builder, fetchAdminSession, (s) => s.adminSession);
    bindResourceLifecycle(
      builder,
      fetchWorkspaceSession,
      (s) => s.workspaceSession
    );
    bindResourceLifecycle(
      builder,
      fetchWorkspaceAccount,
      (s) => s.workspaceAccount
    );
    bindResourceLifecycle(builder, fetchAccounts, (s) => s.directory);
    bindResourceLifecycle(builder, fetchAccountById, (s) => s.selectedAccount, {
      resetOnPending: true,
    });

    const startSaving = (state) => {
      state.saving = true;
      state.actionError = '';
    };
    const failSaving = (state, action) => {
      state.saving = false;
      state.actionError =
        action.payload || action.error?.message || 'Action failed.';
    };

    builder
      .addCase(clearAdminSession, (state) => {
        state.adminSession = createResourceState(null);
      })
      .addCase(clearSelectedAccount, (state) => {
        state.selectedAccount = createResourceState(null);
        state.actionError = '';
      })
      .addCase(clearUsersActionError, (state) => {
        state.actionError = '';
      })

      .addCase(updateAdminProfile.pending, startSaving)
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.saving = false;
        if (state.adminSession.data) {
          state.adminSession.data = {
            ...state.adminSession.data,
            profile: {
              ...state.adminSession.data.profile,
              ...action.payload,
            },
          };
        }
        if (state.workspaceSession.data) {
          state.workspaceSession.data = {
            ...state.workspaceSession.data,
            name: action.payload?.name ?? state.workspaceSession.data.name,
            email: action.payload?.email ?? state.workspaceSession.data.email,
          };
        }
      })
      .addCase(updateAdminProfile.rejected, failSaving)

      .addCase(updateWorkspaceAccount.pending, startSaving)
      .addCase(updateWorkspaceAccount.fulfilled, (state, action) => {
        state.saving = false;
        state.workspaceAccount.data = {
          ...(state.workspaceAccount.data || {}),
          ...action.payload,
        };
        if (state.workspaceSession.data && action.payload?.name) {
          state.workspaceSession.data.name = action.payload.name;
        }
      })
      .addCase(updateWorkspaceAccount.rejected, failSaving)

      .addCase(verifyOrganizationAccount.pending, startSaving)
      .addCase(verifyOrganizationAccount.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedAccount.data = action.payload;
        if (state.directory.data?.items) {
          state.directory.data.items = state.directory.data.items.map((item) =>
            item.id === action.payload?.id
              ? { ...item, status: action.payload.status }
              : item
          );
        }
      })
      .addCase(verifyOrganizationAccount.rejected, failSaving)

      .addCase(toggleAccountAccess.pending, startSaving)
      .addCase(toggleAccountAccess.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedAccount.data = action.payload;
        if (state.directory.data?.items) {
          state.directory.data.items = state.directory.data.items.map((item) =>
            item.id === action.payload?.id
              ? { ...item, status: action.payload.status }
              : item
          );
        }
      })
      .addCase(toggleAccountAccess.rejected, failSaving)

      .addCase(deleteAccount.pending, startSaving)
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedAccount.data = null;
        if (state.directory.data?.items) {
          state.directory.data.items = state.directory.data.items.filter(
            (item) => item.id !== action.payload
          );
        }
      })
      .addCase(deleteAccount.rejected, failSaving)

      .addCase(clearSession, () => initialState);
  },
});

export default usersSlice.reducer;
