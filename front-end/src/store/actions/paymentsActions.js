import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { fetchStudentEnrollments } from './enrollmentsActions';
import { fetchStudentProfile } from './learnersActions';

export const clearPayoutError = createAction('payments/clearPayoutError');
export const resetCheckout = createAction('payments/resetCheckout');

export const fetchStudentBilling = createAsyncThunk(
  'payments/fetchStudentBilling',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await api.get(`/student/billing${query ? `?${query}` : ''}`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load billing records.');
    }
  }
);

export const fetchStudentPaymentById = createAsyncThunk(
  'payments/fetchStudentPaymentById',
  async (paymentId, { rejectWithValue }) => {
    try {
      return await api.get(
        `/student/payments/${encodeURIComponent(paymentId)}`
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load payment details.');
    }
  }
);

export const checkoutCourse = createAsyncThunk(
  'payments/checkoutCourse',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const result = await api.student.checkout(payload);
      await Promise.allSettled([
        dispatch(fetchStudentEnrollments()),
        dispatch(fetchStudentProfile()),
      ]);
      return result;
    } catch (err) {
      return rejectWithValue(err.message || 'Payment failed.');
    }
  }
);

export const fetchAdminPayments = createAsyncThunk(
  'payments/fetchAdminLedger',
  async (
    { search = '', status = '', type = 'Payment', page = 1, limit = 12 } = {},
    { rejectWithValue }
  ) => {
    try {
      const query = new URLSearchParams({ search, status, type, page, limit });
      return await api.get(`/admin/payments?${query}`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load payment ledger.');
    }
  }
);

export const fetchAdminFinance = createAsyncThunk(
  'payments/fetchAdminFinance',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get('/admin/finance');
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load finance summary.');
    }
  }
);

export const recordAdminPayout = createAsyncThunk(
  'payments/recordAdminPayout',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const result = await api.post('/admin/payouts', payload);
      await dispatch(fetchAdminFinance());
      return result;
    } catch (err) {
      await dispatch(fetchAdminFinance());
      return rejectWithValue(err.message || 'Unable to record payout.');
    }
  }
);

export const fetchOrgPayments = createAsyncThunk(
  'payments/fetchOrgPayments',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get('/workspace/organization/payments');
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to load received payments.'
      );
    }
  }
);
