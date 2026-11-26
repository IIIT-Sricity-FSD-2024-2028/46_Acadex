import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { storeSession } from './authActions';
import { extractItems } from '../utils';

export const clearLearnerDetail = createAction('learners/clearLearnerDetail');

export const fetchStudentProfile = createAsyncThunk(
  'learners/fetchStudentProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await api.student.getProfile();
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load student profile.');
    }
  }
);

export const updateStudentProfile = createAsyncThunk(
  'learners/updateStudentProfile',
  async (updates, { dispatch, rejectWithValue }) => {
    try {
      const updated = await api.student.updateProfile(updates);
      if (updated?.name) {
        dispatch(storeSession({ user_name: updated.name }));
      }
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to save profile.');
    }
  }
);

export const fetchOrgLearners = createAsyncThunk(
  'learners/fetchOrgLearners',
  async (_, { rejectWithValue }) => {
    try {
      return extractItems(await api.get('/workspace/organization/learners'));
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load learners.');
    }
  }
);

export const fetchOrgLearnerById = createAsyncThunk(
  'learners/fetchOrgLearnerById',
  async (id, { rejectWithValue }) => {
    try {
      return await api.get(
        `/workspace/organization/learners/${encodeURIComponent(id)}`
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load learner details.');
    }
  }
);

export const fetchInstructorLearnerById = createAsyncThunk(
  'learners/fetchInstructorLearnerById',
  async (id, { rejectWithValue }) => {
    try {
      return await api.get(
        `/workspace/instructor/learners/${encodeURIComponent(id)}`
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load learner progress.');
    }
  }
);

export const fetchLearners = createAsyncThunk(
  'learners/fetchAll',
  async (params = { limit: 1000 }, { rejectWithValue }) => {
    try {
      return extractItems(await api.learners.list(params));
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load learners.');
    }
  }
);

export const createLearner = createAsyncThunk(
  'learners/create',
  async (data, { rejectWithValue }) => {
    try {
      return await api.learners.create(data);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to create learner.');
    }
  }
);

export const updateLearner = createAsyncThunk(
  'learners/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await api.learners.update(id, data);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to update learner.');
    }
  }
);

export const deleteLearner = createAsyncThunk(
  'learners/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.learners.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to delete learner.');
    }
  }
);
