import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await api.settings.get();
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load settings.');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/update',
  async (newSettings, { rejectWithValue }) => {
    try {
      return await api.settings.update(newSettings);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to update settings.');
    }
  }
);

export const resetDatabase = createAsyncThunk(
  'settings/resetDatabase',
  async (_, { rejectWithValue }) => {
    try {
      return await api.settings.resetDatabase();
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to reset database.');
    }
  }
);
