import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  dismissWorkspaceNotification,
  fetchInstructorNotifications,
  fetchInstructorUnreadCount,
  fetchWorkspaceNotifications,
  markAllInstructorNotificationsRead,
  markAllWorkspaceNotificationsRead,
  markInstructorNotificationRead,
  markWorkspaceNotificationRead,
} from '../actions/notificationsActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  workspace: {
    ...createResourceState(null),
    busyPath: '',
    actionError: '',
  },
  instructor: {
    ...createResourceState([]),
    unreadCount: 0,
  },
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(
      builder,
      fetchWorkspaceNotifications,
      (s) => s.workspace
    );
    bindResourceLifecycle(
      builder,
      fetchInstructorNotifications,
      (s) => s.instructor
    );

    const recomputeUnread = (items) => items.filter((n) => !n.read).length;

    builder
      .addCase(markWorkspaceNotificationRead.pending, (state, action) => {
        state.workspace.busyPath = `/workspace/notifications/${action.meta.arg}/read`;
        state.workspace.actionError = '';
      })
      .addCase(markWorkspaceNotificationRead.fulfilled, (state, action) => {
        state.workspace.busyPath = '';
        const id = action.payload;
        if (state.workspace.data?.items) {
          state.workspace.data.items = state.workspace.data.items.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          state.workspace.data.unreadCount = recomputeUnread(
            state.workspace.data.items
          );
        }
      })
      .addCase(markWorkspaceNotificationRead.rejected, (state, action) => {
        state.workspace.busyPath = '';
        state.workspace.actionError =
          action.payload || action.error?.message || 'Action failed.';
      })

      .addCase(markAllWorkspaceNotificationsRead.pending, (state) => {
        state.workspace.busyPath = '/workspace/notifications/read-all';
        state.workspace.actionError = '';
      })
      .addCase(markAllWorkspaceNotificationsRead.fulfilled, (state) => {
        state.workspace.busyPath = '';
        if (state.workspace.data?.items) {
          state.workspace.data.items = state.workspace.data.items.map((n) => ({
            ...n,
            read: true,
          }));
          state.workspace.data.unreadCount = 0;
        }
      })
      .addCase(markAllWorkspaceNotificationsRead.rejected, (state, action) => {
        state.workspace.busyPath = '';
        state.workspace.actionError =
          action.payload || action.error?.message || 'Action failed.';
      })

      .addCase(dismissWorkspaceNotification.pending, (state, action) => {
        state.workspace.busyPath = `/workspace/notifications/${action.meta.arg}`;
        state.workspace.actionError = '';
      })
      .addCase(dismissWorkspaceNotification.fulfilled, (state, action) => {
        state.workspace.busyPath = '';
        const id = action.payload;
        if (state.workspace.data?.items) {
          state.workspace.data.items = state.workspace.data.items.filter(
            (n) => n.id !== id
          );
          state.workspace.data.unreadCount = recomputeUnread(
            state.workspace.data.items
          );
        }
      })
      .addCase(dismissWorkspaceNotification.rejected, (state, action) => {
        state.workspace.busyPath = '';
        state.workspace.actionError =
          action.payload || action.error?.message || 'Action failed.';
      })

      .addCase(fetchInstructorUnreadCount.fulfilled, (state, action) => {
        state.instructor.unreadCount = action.payload;
      })
      .addCase(markInstructorNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        if (Array.isArray(state.instructor.data)) {
          state.instructor.data = state.instructor.data.map((n) =>
            n.id === id ? { ...n, read: true, unread: false } : n
          );
          state.instructor.unreadCount = state.instructor.data.filter(
            (n) => n.unread ?? !n.read
          ).length;
        }
      })
      .addCase(markAllInstructorNotificationsRead.fulfilled, (state) => {
        if (Array.isArray(state.instructor.data)) {
          state.instructor.data = state.instructor.data.map((n) => ({
            ...n,
            read: true,
            unread: false,
          }));
          state.instructor.unreadCount = 0;
        }
      })

      .addCase(clearSession, () => initialState);
  },
});

export default notificationsSlice.reducer;
