import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { storeSession } from './authActions';
import { extractItems } from '../utils';

export const clearSelectedInstructor = createAction(
  'instructors/clearSelectedInstructor'
);

export const fetchInstructorWorkspace = createAsyncThunk(
  'instructors/fetchWorkspace',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const workspace = await api.get('/workspace/instructor');
      if (workspace?.instructor?.id) {
        dispatch(
          storeSession({ nexuspay_instructor_id: workspace.instructor.id })
        );
      }
      return workspace;
    } catch (err) {
      return rejectWithValue(
        err.message || 'No instructor profile is linked to this account'
      );
    }
  }
);

export const fetchInstructors = createAsyncThunk(
  'instructors/fetchAll',
  async (params = { limit: 1000 }, { rejectWithValue }) => {
    try {
      return extractItems(await api.instructors.list(params));
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load instructors.');
    }
  }
);

export const fetchOrgInstructorById = createAsyncThunk(
  'instructors/fetchOrgInstructorById',
  async (id, { rejectWithValue }) => {
    try {
      return await api.get(
        `/workspace/organization/instructors/${encodeURIComponent(id)}`
      );
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to load instructor details.'
      );
    }
  }
);

export const updateInstructorStatus = createAsyncThunk(
  'instructors/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const updated = await api.patch(
        `/instructors/${encodeURIComponent(id)}`,
        {
          status,
        }
      );
      const detail = await api.get(
        `/workspace/organization/instructors/${encodeURIComponent(id)}`
      );
      return { updated, detail };
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to update instructor status.'
      );
    }
  }
);

export const leaveOrganization = createAsyncThunk(
  'instructors/leaveOrganization',
  async (instructorId, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.instructors.leaveOrganization(instructorId);
      await dispatch(fetchInstructorWorkspace());
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to leave organization.');
    }
  }
);
