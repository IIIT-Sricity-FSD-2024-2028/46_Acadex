import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  fetchAdminHistory,
  fetchAdminOverview,
  fetchHistoryAdminOptions,
  fetchHistoryCourseOptions,
  fetchLogById,
  fetchLogs,
  fetchOrgAnalytics,
  fetchSuperAdminExecutive,
  fetchWorkspaceOverview,
} from '../actions/analyticsActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  workspaceOverview: createResourceState(null),
  orgAnalytics: createResourceState(null),
  adminOverview: createResourceState(null),
  superAdminExecutive: createResourceState(null),
  adminHistory: createResourceState(null),
  historyAdminOptions: createResourceState(null),
  historyCourseOptions: createResourceState(null),
  logs: createResourceState(null),
  selectedLog: createResourceState(null),
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(
      builder,
      fetchWorkspaceOverview,
      (s) => s.workspaceOverview
    );
    bindResourceLifecycle(builder, fetchOrgAnalytics, (s) => s.orgAnalytics);
    bindResourceLifecycle(builder, fetchAdminOverview, (s) => s.adminOverview);
    bindResourceLifecycle(
      builder,
      fetchSuperAdminExecutive,
      (s) => s.superAdminExecutive
    );
    bindResourceLifecycle(builder, fetchAdminHistory, (s) => s.adminHistory);
    bindResourceLifecycle(
      builder,
      fetchHistoryAdminOptions,
      (s) => s.historyAdminOptions
    );
    bindResourceLifecycle(
      builder,
      fetchHistoryCourseOptions,
      (s) => s.historyCourseOptions
    );
    bindResourceLifecycle(builder, fetchLogs, (s) => s.logs);
    bindResourceLifecycle(builder, fetchLogById, (s) => s.selectedLog, {
      resetOnPending: true,
    });

    builder.addCase(clearSession, () => initialState);
  },
});

export default analyticsSlice.reducer;
