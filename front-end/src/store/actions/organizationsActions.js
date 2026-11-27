import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { extractItems } from '../utils';

export const fetchOrgProfile = createAsyncThunk(
  'organizations/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await api.organization.get();
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load organization.');
    }
  }
);

export const updateOrgProfile = createAsyncThunk(
  'organizations/updateProfile',
  async (newInfo, { rejectWithValue }) => {
    try {
      return await api.organization.update(newInfo);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to update organization.');
    }
  }
);

export const fetchOrgStats = createAsyncThunk(
  'organizations/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await api.organization.getStats();
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to load organization stats.'
      );
    }
  }
);

export const syncOrgCounts = createAsyncThunk(
  'organizations/syncCounts',
  async (_, { rejectWithValue }) => {
    try {
      const synced = await api.organization.syncCounts();
      if (!synced) return null;
      return await api.organization.get();
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to sync organization counts.'
      );
    }
  }
);

export const fetchInstitutions = createAsyncThunk(
  'organizations/fetchInstitutions',
  async (_, { rejectWithValue }) => {
    try {
      return extractItems(await api.organization.listInstitutions());
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load institutions.');
    }
  }
);

export const verifyInstitution = createAsyncThunk(
  'organizations/verifyInstitution',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await api.organization.verifyInstitution(id, data);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to verify institution.');
    }
  }
);
