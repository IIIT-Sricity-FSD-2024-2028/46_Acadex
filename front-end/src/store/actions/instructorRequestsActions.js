import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { fetchInstructorWorkspace } from './instructorsActions';
import { extractItems } from '../utils';

export const clearInstructorLookup = createAction(
  'instructorRequests/clearInstructorLookup'
);
export const clearRequestActionError = createAction(
  'instructorRequests/clearRequestActionError'
);

export const fetchMyInvitations = createAsyncThunk(
  'instructorRequests/fetchMyInvitations',
  async (instructorId, { rejectWithValue }) => {
    try {
      return extractItems(
        await api.instructorRequests.list({ instructorId, limit: 1000 })
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load invitations.');
    }
  }
);

export const fetchMyJoinRequests = createAsyncThunk(
  'instructorRequests/fetchMyJoinRequests',
  async (_, { rejectWithValue }) => {
    try {
      return extractItems(await api.instructorRequests.myJoinRequests());
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load join requests.');
    }
  }
);

export const respondInvitation = createAsyncThunk(
  'instructorRequests/respondInvitation',
  async (
    { id, decision, notes, instructorId },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await api.instructorRequests.respond(id, decision, notes);
      await dispatch(fetchInstructorWorkspace());
      if (instructorId) {
        await dispatch(fetchMyInvitations(instructorId));
      }
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to respond to invitation.');
    }
  }
);

export const fetchTeachingAssignments = createAsyncThunk(
  'instructorRequests/fetchTeachingAssignments',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get('/workspace/organization/teaching-assignments');
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to load teaching assignments.'
      );
    }
  }
);

export const fetchIncomingJoinRequests = createAsyncThunk(
  'instructorRequests/fetchIncomingJoinRequests',
  async (_, { rejectWithValue }) => {
    try {
      return extractItems(await api.instructorRequests.incomingJoinRequests());
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load join requests.');
    }
  }
);

export const fetchAllInstructorRequests = createAsyncThunk(
  'instructorRequests/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return extractItems(await api.instructorRequests.list({ limit: 1000 }));
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load requests.');
    }
  }
);

export const lookupInstructorByEmail = createAsyncThunk(
  'instructorRequests/lookupByEmail',
  async (email, { rejectWithValue }) => {
    try {
      return await api.get(
        `/workspace/organization/invitation-lookup?${new URLSearchParams({ email })}`
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Instructor not found.');
    }
  }
);

export const sendInvitation = createAsyncThunk(
  'instructorRequests/sendInvitation',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const created = await api.instructorRequests.create(payload);
      await dispatch(fetchTeachingAssignments());
      return created;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to send invitation.');
    }
  }
);

export const resendInvitation = createAsyncThunk(
  'instructorRequests/resendInvitation',
  async (requestId, { rejectWithValue }) => {
    try {
      return await api.instructorRequests.resend(requestId);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to resend invitation.');
    }
  }
);

export const withdrawInvitation = createAsyncThunk(
  'instructorRequests/withdrawInvitation',
  async ({ requestId, reason }, { rejectWithValue }) => {
    try {
      return await api.instructorRequests.withdraw(requestId, reason);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to withdraw invitation.');
    }
  }
);

export const decideJoinRequest = createAsyncThunk(
  'instructorRequests/decideJoinRequest',
  async ({ requestId, action, notes }, { dispatch, rejectWithValue }) => {
    try {
      const updated = await api.instructorRequests.decideJoinRequest(
        requestId,
        action,
        notes
      );
      await Promise.allSettled([
        dispatch(fetchIncomingJoinRequests()),
        dispatch(fetchTeachingAssignments()),
      ]);
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to decide join request.');
    }
  }
);
