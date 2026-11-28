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
import { createResourceState } from '../utils';

const initialState = {
  workspace: {
    ...createResourceState(null),
    busyPath: '',
    actionError: '',
    readMutation: null,
  },
  instructor: {
    ...createResourceState([]),
    unreadCount: 0,
    readMutation: null,
    actionError: '',
  },
};

// Keep a snapshot of the confirmed view; reads during an optimistic mutation
// must not replace it with a response from before the write completed.
function bindInbox(builder, thunk, select) {
  builder
    .addCase(thunk.pending, (state) => {
      const slot = select(state);
      slot.loading = true;
      slot.error = '';
    })
    .addCase(thunk.fulfilled, (state, action) => {
      const slot = select(state);
      slot.loading = false;
      if (!slot.readMutation) slot.data = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      const slot = select(state);
      slot.loading = false;
      slot.error =
        action.payload ||
        action.error?.message ||
        'Unable to load notifications.';
    });
}

function startWorkspaceRead(state, action, all = false) {
  const slot = state.workspace;
  slot.readMutation = { requestId: action.meta.requestId, previous: slot.data };
  slot.busyPath = all
    ? '/workspace/notifications/read-all'
    : `/workspace/notifications/${action.meta.arg}/read`;
  slot.actionError = '';
  if (slot.data?.items) {
    const items = slot.data.items.map((item) =>
      all || item.id === action.meta.arg ? { ...item, read: true } : item
    );
    slot.data = {
      ...slot.data,
      items,
      unreadCount: items.filter((item) => !item.read).length,
    };
  }
}

function endWorkspaceRead(state, action, failed = false) {
  const slot = state.workspace;
  if (slot.readMutation?.requestId !== action.meta.requestId) return;
  if (failed) {
    slot.data = slot.readMutation.previous;
    slot.actionError =
      action.payload || action.error?.message || 'Action failed.';
  }
  slot.readMutation = null;
  slot.busyPath = '';
}

function startInstructorRead(state, action, all = false) {
  const slot = state.instructor;
  slot.readMutation = {
    requestId: action.meta.requestId,
    previous: slot.data,
    unreadCount: slot.unreadCount,
  };
  slot.actionError = '';
  const unread = slot.data.some(
    (item) => item.id === action.meta.arg && (item.unread ?? !item.read)
  );
  slot.data = slot.data.map((item) =>
    all || item.id === action.meta.arg
      ? { ...item, read: true, unread: false }
      : item
  );
  slot.unreadCount = all ? 0 : Math.max(0, slot.unreadCount - Number(unread));
}

function endInstructorRead(state, action, failed = false) {
  const slot = state.instructor;
  const snapshot = slot.readMutation;
  if (snapshot?.requestId !== action.meta.requestId) return;
  if (failed) {
    slot.data = snapshot.previous;
    slot.unreadCount = snapshot.unreadCount;
    slot.actionError =
      action.payload || action.error?.message || 'Action failed.';
  }
  slot.readMutation = null;
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindInbox(builder, fetchWorkspaceNotifications, (s) => s.workspace);
    bindInbox(builder, fetchInstructorNotifications, (s) => s.instructor);

    const recomputeUnread = (items) => items.filter((n) => !n.read).length;

    builder
      .addCase(markWorkspaceNotificationRead.pending, (state, action) => {
        startWorkspaceRead(state, action);
      })
      .addCase(markWorkspaceNotificationRead.fulfilled, (state, action) => {
        endWorkspaceRead(state, action);
      })
      .addCase(markWorkspaceNotificationRead.rejected, (state, action) => {
        endWorkspaceRead(state, action, true);
      })

      .addCase(markAllWorkspaceNotificationsRead.pending, (state, action) => {
        startWorkspaceRead(state, action, true);
      })
      .addCase(markAllWorkspaceNotificationsRead.fulfilled, (state, action) => {
        endWorkspaceRead(state, action);
      })
      .addCase(markAllWorkspaceNotificationsRead.rejected, (state, action) => {
        endWorkspaceRead(state, action, true);
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
        if (!state.instructor.readMutation)
          state.instructor.unreadCount = action.payload;
      })
      .addCase(markInstructorNotificationRead.pending, (state, action) => {
        startInstructorRead(state, action);
      })
      .addCase(markInstructorNotificationRead.fulfilled, (state, action) => {
        endInstructorRead(state, action);
      })
      .addCase(markInstructorNotificationRead.rejected, (state, action) => {
        endInstructorRead(state, action, true);
      })
      .addCase(markAllInstructorNotificationsRead.pending, (state, action) => {
        startInstructorRead(state, action, true);
      })
      .addCase(
        markAllInstructorNotificationsRead.fulfilled,
        (state, action) => {
          endInstructorRead(state, action);
        }
      )
      .addCase(markAllInstructorNotificationsRead.rejected, (state, action) => {
        endInstructorRead(state, action, true);
      })

      .addCase(clearSession, () => initialState);
  },
});

export default notificationsSlice.reducer;
