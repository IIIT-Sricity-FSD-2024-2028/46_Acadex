import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  clearDownloadError,
  clearVerification,
  downloadCertificatePdf,
  fetchAllCertificates,
  fetchCertificateById,
  fetchStudentCertificates,
  setSelectedCertificate,
  verifyCertificate,
} from '../actions/certificatesActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  studentItems: createResourceState([]),
  adminItems: createResourceState([]),
  selected: createResourceState(null),
  verification: createResourceState(null),
  downloadingId: '',
  downloadError: '',
};

const certificatesSlice = createSlice({
  name: 'certificates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(
      builder,
      fetchStudentCertificates,
      (s) => s.studentItems
    );
    bindResourceLifecycle(builder, fetchAllCertificates, (s) => s.adminItems);
    bindResourceLifecycle(builder, fetchCertificateById, (s) => s.selected);
    bindResourceLifecycle(builder, verifyCertificate, (s) => s.verification, {
      resetOnPending: true,
    });

    builder
      .addCase(setSelectedCertificate, (state, action) => {
        state.selected.data = action.payload;
        state.selected.error = '';
      })
      .addCase(clearVerification, (state) => {
        state.verification = createResourceState(null);
      })
      .addCase(clearDownloadError, (state) => {
        state.downloadError = '';
      })
      .addCase(downloadCertificatePdf.pending, (state, action) => {
        state.downloadingId = action.meta.arg?.certificate?.id || 'pending';
        state.downloadError = '';
      })
      .addCase(downloadCertificatePdf.fulfilled, (state) => {
        state.downloadingId = '';
      })
      .addCase(downloadCertificatePdf.rejected, (state, action) => {
        state.downloadingId = '';
        state.downloadError =
          action.payload ||
          action.error?.message ||
          'Unable to download certificate.';
      })
      .addCase(clearSession, () => initialState);
  },
});

export default certificatesSlice.reducer;
