import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { extractItems } from '../utils';

export const clearSelectedDispute = createAction(
  'disputes/clearSelectedDispute'
);
export const clearDisputeError = createAction('disputes/clearDisputeError');

export const fetchAdminDisputes = createAsyncThunk(
  'disputes/fetchAdminAll',
  async (_, { rejectWithValue }) => {
    try {
      return extractItems(await api.get('/disputes?limit=1000'));
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load disputes.');
    }
  }
);

export const fetchAdminDisputeById = createAsyncThunk(
  'disputes/fetchAdminById',
  async (id, { rejectWithValue }) => {
    try {
      return await api.get(`/disputes/${encodeURIComponent(id)}`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load dispute details.');
    }
  }
);

export const transitionDispute = createAsyncThunk(
  'disputes/transition',
  async ({ disputeId, status, note }, { rejectWithValue }) => {
    try {
      return await api.post(
        `/admin/disputes/${encodeURIComponent(disputeId)}/transition`,
        { status, note }
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to update dispute status.');
    }
  }
);

export const addAdminDisputeComment = createAsyncThunk(
  'disputes/addAdminComment',
  async ({ disputeId, message }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      let author =
        state.users?.workspaceSession?.data?.name ||
        state.auth?.user_name ||
        '';
      if (!author) {
        const session = await api.get('/workspace/session');
        author = session?.name || 'Administrator';
      }
      return await api.post(
        `/disputes/${encodeURIComponent(disputeId)}/comments`,
        { author, message, isAdmin: true }
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to add comment.');
    }
  }
);

export const fetchStudentDisputes = createAsyncThunk(
  'disputes/fetchStudentAll',
  async (_, { rejectWithValue }) => {
    try {
      return extractItems(await api.get('/student/disputes'));
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load support requests.');
    }
  }
);

export const fetchStudentDisputeCategories = createAsyncThunk(
  'disputes/fetchStudentCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/student/dispute-categories');
      return Array.isArray(res) ? res : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load categories.');
    }
  }
);

export const fetchStudentDisputeById = createAsyncThunk(
  'disputes/fetchStudentById',
  async (disputeId, { rejectWithValue }) => {
    try {
      return await api.get(
        `/student/disputes/${encodeURIComponent(disputeId)}`
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load support case.');
    }
  }
);

export const createStudentDispute = createAsyncThunk(
  'disputes/createStudent',
  async (form, { rejectWithValue }) => {
    try {
      return await api.post('/student/disputes', form);
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to create support request.'
      );
    }
  }
);

export const addStudentDisputeComment = createAsyncThunk(
  'disputes/addStudentComment',
  async ({ disputeId, message }, { rejectWithValue }) => {
    try {
      await api.post(
        `/student/disputes/${encodeURIComponent(disputeId)}/comments`,
        { message }
      );
      return await api.get(
        `/student/disputes/${encodeURIComponent(disputeId)}`
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to send message.');
    }
  }
);

export const fetchOrgSupport = createAsyncThunk(
  'disputes/fetchOrgSupport',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get('/workspace/organization/support');
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load support requests.');
    }
  }
);

export const createOrgSupport = createAsyncThunk(
  'disputes/createOrgSupport',
  async (form, { dispatch, rejectWithValue }) => {
    try {
      const created = await api.post('/workspace/organization/support', form);
      await dispatch(fetchOrgSupport());
      return created;
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to submit support request.'
      );
    }
  }
);
