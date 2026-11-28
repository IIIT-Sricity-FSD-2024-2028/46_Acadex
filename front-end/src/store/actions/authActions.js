import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const AUTH_STORAGE_KEYS = [
  'nexuspay_auth_token',
  'auth_token',
  'nexuspay_student_token',
  'user_id',
  'nexuspay_user_id',
  'user_role',
  'nexuspay_active_role',
  'user_name',
  'user_email',
  'nexuspay_user_email',
  'user_organization_id',
  'user_organization_name',
  'nexuspay_instructor_id',
];

export const readAuthStorage = () =>
  Object.fromEntries(
    AUTH_STORAGE_KEYS.map((key) => [key, localStorage.getItem(key)])
  );

export const mirrored = createAction('auth/mirrored');

export const storeSession = createAction(
  'auth/sessionStored',
  (values, emptyNullish = false) => ({
    payload: { values, emptyNullish },
  })
);

export const clearSession = createAction(
  'auth/sessionCleared',
  (keys = AUTH_STORAGE_KEYS) => ({
    payload: keys,
  })
);

export const authErrorCleared = createAction('auth/authErrorCleared');

export const syncAuth = () => (dispatch) =>
  dispatch(mirrored(readAuthStorage()));

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await api.auth.login(email, password);
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to sign in. Please try again.'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (form, { rejectWithValue }) => {
    try {
      return await api.auth.register(form);
    } catch (err) {
      return rejectWithValue(err.message || 'Could not create your account.');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword, userId }, { rejectWithValue }) => {
    try {
      return await api.auth.changePassword(
        currentPassword,
        newPassword,
        userId
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to change password.');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      return await api.auth.requestPasswordReset(email);
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to start password recovery. Please try again.'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, code, password }, { rejectWithValue }) => {
    try {
      return await api.auth.resetPassword(email, code, password);
    } catch (err) {
      return rejectWithValue(
        err.message ||
          'Unable to reset your password. Please check the code and try again.'
      );
    }
  }
);
