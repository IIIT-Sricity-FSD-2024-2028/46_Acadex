import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { storeSession } from './authActions';

export const clearAdminSession = createAction('users/clearAdminSession');
export const clearSelectedAccount = createAction('users/clearSelectedAccount');
export const clearUsersActionError = createAction(
  'users/clearUsersActionError'
);

export const fetchAdminSession = createAsyncThunk(
  'users/fetchAdminSession',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get('/admin/session');
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load admin session.');
    }
  }
);

export const updateAdminProfile = createAsyncThunk(
  'users/updateAdminProfile',
  async (form, { dispatch, rejectWithValue }) => {
    try {
      const updated = await api.patch('/admin/profile', form);
      dispatch(
        storeSession({
          user_name: updated?.name ?? form.name,
          user_email: updated?.email ?? form.email,
          nexuspay_user_email: updated?.email ?? form.email,
        })
      );
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to update admin profile.');
    }
  }
);

export const fetchWorkspaceSession = createAsyncThunk(
  'users/fetchWorkspaceSession',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get('/workspace/session');
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to load workspace session.'
      );
    }
  }
);

export const fetchWorkspaceAccount = createAsyncThunk(
  'users/fetchWorkspaceAccount',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get('/workspace/account');
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load account details.');
    }
  }
);

export const updateWorkspaceAccount = createAsyncThunk(
  'users/updateWorkspaceAccount',
  async (form, { dispatch, rejectWithValue }) => {
    try {
      const updated = await api.patch('/workspace/account', form);
      if (updated?.name) {
        dispatch(storeSession({ user_name: updated.name }));
      }
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to update account.');
    }
  }
);

export const fetchAccounts = createAsyncThunk(
  'users/fetchAccounts',
  async (role = 'Learner', { rejectWithValue }) => {
    try {
      return await api.get(`/admin/accounts?role=${encodeURIComponent(role)}`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load accounts.');
    }
  }
);

export const fetchAccountById = createAsyncThunk(
  'users/fetchAccountById',
  async (userId, { rejectWithValue }) => {
    try {
      return await api.get(`/admin/accounts/${encodeURIComponent(userId)}`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load account details.');
    }
  }
);

export const verifyOrganizationAccount = createAsyncThunk(
  'users/verifyOrganizationAccount',
  async ({ userId, decision, reason }, { rejectWithValue }) => {
    try {
      await api.post(
        `/admin/accounts/${encodeURIComponent(userId)}/verification`,
        {
          decision,
          reason,
        }
      );
      return await api.get(`/admin/accounts/${encodeURIComponent(userId)}`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to verify organization.');
    }
  }
);

export const toggleAccountAccess = createAsyncThunk(
  'users/toggleAccountAccess',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      await api.patch(`/admin/accounts/${encodeURIComponent(userId)}`, {
        status,
      });
      return await api.get(`/admin/accounts/${encodeURIComponent(userId)}`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to update account status.');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'users/deleteAccount',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/accounts/${encodeURIComponent(userId)}`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to delete account.');
    }
  }
);
