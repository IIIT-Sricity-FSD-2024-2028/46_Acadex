import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  checkoutCourse,
  clearPayoutError,
  fetchAdminFinance,
  fetchAdminPayments,
  fetchOrgPayments,
  fetchStudentBilling,
  fetchStudentPaymentById,
  recordAdminPayout,
  resetCheckout,
} from '../actions/paymentsActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  studentBilling: createResourceState(null),
  selectedReceipt: createResourceState(null),
  adminLedger: createResourceState(null),
  adminFinance: createResourceState(null),
  orgPayments: createResourceState(null),
  checkout: {
    result: null,
    processing: false,
    error: '',
  },
  payoutBusy: false,
  payoutError: '',
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(
      builder,
      fetchStudentBilling,
      (s) => s.studentBilling
    );
    bindResourceLifecycle(
      builder,
      fetchStudentPaymentById,
      (s) => s.selectedReceipt,
      { resetOnPending: true }
    );
    bindResourceLifecycle(builder, fetchAdminPayments, (s) => s.adminLedger);
    bindResourceLifecycle(builder, fetchAdminFinance, (s) => s.adminFinance);
    bindResourceLifecycle(builder, fetchOrgPayments, (s) => s.orgPayments);

    builder
      .addCase(clearPayoutError, (state) => {
        state.payoutError = '';
      })
      .addCase(resetCheckout, (state) => {
        state.checkout = { result: null, processing: false, error: '' };
      })

      .addCase(checkoutCourse.pending, (state) => {
        state.checkout.processing = true;
        state.checkout.error = '';
      })
      .addCase(checkoutCourse.fulfilled, (state, action) => {
        state.checkout.processing = false;
        state.checkout.result = action.payload;
      })
      .addCase(checkoutCourse.rejected, (state, action) => {
        state.checkout.processing = false;
        state.checkout.error =
          action.payload || action.error?.message || 'Payment failed.';
      })

      .addCase(recordAdminPayout.pending, (state) => {
        state.payoutBusy = true;
        state.payoutError = '';
      })
      .addCase(recordAdminPayout.fulfilled, (state) => {
        state.payoutBusy = false;
      })
      .addCase(recordAdminPayout.rejected, (state, action) => {
        state.payoutBusy = false;
        state.payoutError =
          action.payload || action.error?.message || 'Unable to record payout.';
      })

      .addCase(clearSession, () => initialState);
  },
});

export default paymentsSlice.reducer;
