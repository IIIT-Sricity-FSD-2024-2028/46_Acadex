import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { extractItems } from '../utils';

export const fetchWorkspaceNotifications = createAsyncThunk(
  'notifications/fetchWorkspace',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get('/workspace/notifications');
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load notifications.');
    }
  }
);

export const markWorkspaceNotificationRead = createAsyncThunk(
  'notifications/markWorkspaceRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(
        `/workspace/notifications/${encodeURIComponent(id)}/read`,
        {}
      );
      return id;
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to mark notification read.'
      );
    }
  }
);

export const markAllWorkspaceNotificationsRead = createAsyncThunk(
  'notifications/markAllWorkspaceRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/workspace/notifications/read-all', {});
      return true;
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to mark all notifications read.'
      );
    }
  }
);

export const dismissWorkspaceNotification = createAsyncThunk(
  'notifications/dismissWorkspace',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/workspace/notifications/${encodeURIComponent(id)}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to dismiss notification.');
    }
  }
);

export const fetchInstructorNotifications = createAsyncThunk(
  'notifications/fetchInstructor',
  async ({ category, recipientId } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (recipientId) params.append('recipientId', recipientId);
      else params.append('role', 'instructor');
      return extractItems(
        await api.get(`/notifications?${params.toString()}`, 'instructor')
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load notifications.');
    }
  }
);

export const fetchInstructorUnreadCount = createAsyncThunk(
  'notifications/fetchInstructorUnreadCount',
  async (instructorId, { rejectWithValue }) => {
    try {
      const q = instructorId
        ? `?recipientId=${encodeURIComponent(instructorId)}`
        : '?role=instructor';
      const res = await api.get(
        `/notifications/unread-count${q}`,
        'instructor'
      );
      return typeof res?.unreadCount === 'number'
        ? res.unreadCount
        : (res?.data?.unreadCount ?? 0);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load unread count.');
    }
  }
);

export const markInstructorNotificationRead = createAsyncThunk(
  'notifications/markInstructorRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(
        `/notifications/${encodeURIComponent(id)}/read`,
        {},
        'instructor'
      );
      return id;
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to mark notification read.'
      );
    }
  }
);

export const markAllInstructorNotificationsRead = createAsyncThunk(
  'notifications/markAllInstructorRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/notifications/mark-all-read', {}, 'instructor');
      return true;
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to mark all notifications read.'
      );
    }
  }
);
