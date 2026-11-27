import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  archiveAdminCourse,
  assignCourseInstructors,
  browseStudentCatalog,
  clearCourseErrors,
  clearSelectedCatalogCourse,
  createCourse,
  deleteAdminCourse,
  fetchAdminCourseById,
  fetchAdminCourseQueue,
  fetchAdminCourses,
  fetchAssignmentOptions,
  fetchOrgCourseById,
  fetchOrgCourses,
  fetchPublicLanding,
  fetchStudentCatalog,
  fetchStudentCatalogCourse,
  reviewAdminCourse,
  submitCourseForApproval,
  updateAdminCourse,
  updateCourse,
} from '../actions/coursesActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  publicLanding: createResourceState(null),
  catalog: createResourceState([]),
  browse: createResourceState(null),
  selectedCatalogCourse: createResourceState(null),
  orgCourses: createResourceState(null),
  selectedOrgCourse: createResourceState(null),
  assignmentOptions: createResourceState(null),
  adminQueue: createResourceState(null),
  adminCourses: createResourceState(null),
  selectedAdminCourse: createResourceState(null),
  actionLoading: false,
  actionError: '',
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(builder, fetchPublicLanding, (s) => s.publicLanding);
    bindResourceLifecycle(builder, fetchStudentCatalog, (s) => s.catalog);
    bindResourceLifecycle(builder, browseStudentCatalog, (s) => s.browse);
    bindResourceLifecycle(
      builder,
      fetchStudentCatalogCourse,
      (s) => s.selectedCatalogCourse,
      { resetOnPending: true }
    );
    bindResourceLifecycle(builder, fetchOrgCourses, (s) => s.orgCourses);
    bindResourceLifecycle(
      builder,
      fetchOrgCourseById,
      (s) => s.selectedOrgCourse,
      { resetOnPending: true }
    );
    bindResourceLifecycle(
      builder,
      fetchAssignmentOptions,
      (s) => s.assignmentOptions
    );
    bindResourceLifecycle(builder, fetchAdminCourseQueue, (s) => s.adminQueue);
    bindResourceLifecycle(builder, fetchAdminCourses, (s) => s.adminCourses);
    bindResourceLifecycle(
      builder,
      fetchAdminCourseById,
      (s) => s.selectedAdminCourse,
      { resetOnPending: true }
    );

    const startAction = (state) => {
      state.actionLoading = true;
      state.actionError = '';
    };
    const failAction = (state, action) => {
      state.actionLoading = false;
      state.actionError =
        action.payload || action.error?.message || 'Course action failed.';
    };

    builder
      .addCase(clearCourseErrors, (state) => {
        state.actionError = '';
      })
      .addCase(clearSelectedCatalogCourse, (state) => {
        state.selectedCatalogCourse = createResourceState(null);
      })

      .addCase(createCourse.pending, startAction)
      .addCase(createCourse.fulfilled, (state, action) => {
        state.actionLoading = false;
        const created = action.payload;
        if (created && state.orgCourses.data?.items) {
          state.orgCourses.data.items = [
            created,
            ...state.orgCourses.data.items.filter((c) => c.id !== created.id),
          ];
        }
      })
      .addCase(createCourse.rejected, failAction)

      .addCase(updateCourse.pending, startAction)
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { id, updated } = action.payload;
        if (state.orgCourses.data?.items) {
          state.orgCourses.data.items = state.orgCourses.data.items.map((c) =>
            c.id === id ? { ...c, ...updated } : c
          );
        }
        if (state.selectedOrgCourse.data?.id === id) {
          state.selectedOrgCourse.data = {
            ...state.selectedOrgCourse.data,
            ...updated,
          };
        }
      })
      .addCase(updateCourse.rejected, failAction)

      .addCase(submitCourseForApproval.pending, startAction)
      .addCase(submitCourseForApproval.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedOrgCourse.data = action.payload;
        if (state.orgCourses.data?.items && action.payload?.id) {
          state.orgCourses.data.items = state.orgCourses.data.items.map((c) =>
            c.id === action.payload.id
              ? { ...c, status: action.payload.status }
              : c
          );
        }
      })
      .addCase(submitCourseForApproval.rejected, failAction)

      .addCase(assignCourseInstructors.pending, startAction)
      .addCase(assignCourseInstructors.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(assignCourseInstructors.rejected, failAction)

      .addCase(reviewAdminCourse.pending, startAction)
      .addCase(reviewAdminCourse.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { courseId, decision } = action.payload;
        if (state.adminCourses.data?.items) {
          state.adminCourses.data.items = state.adminCourses.data.items.filter(
            (c) => c.id !== courseId
          );
        }
        if (state.selectedAdminCourse.data?.id === courseId) {
          state.selectedAdminCourse.data.status =
            decision === 'approve' ? 'Published' : 'Rejected';
        }
      })
      .addCase(reviewAdminCourse.rejected, failAction)

      .addCase(updateAdminCourse.pending, startAction)
      .addCase(updateAdminCourse.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { courseId, updated } = action.payload;
        if (state.selectedAdminCourse.data?.id === courseId) {
          state.selectedAdminCourse.data = {
            ...state.selectedAdminCourse.data,
            ...updated,
          };
        }
        if (state.adminCourses.data?.items) {
          state.adminCourses.data.items = state.adminCourses.data.items.map(
            (c) => (c.id === courseId ? { ...c, ...updated } : c)
          );
        }
      })
      .addCase(updateAdminCourse.rejected, failAction)

      .addCase(archiveAdminCourse.pending, startAction)
      .addCase(archiveAdminCourse.fulfilled, (state, action) => {
        state.actionLoading = false;
        const id = action.payload;
        if (state.selectedAdminCourse.data?.id === id) {
          state.selectedAdminCourse.data.status = 'Archived';
        }
        if (state.adminCourses.data?.items) {
          state.adminCourses.data.items = state.adminCourses.data.items.map(
            (c) => (c.id === id ? { ...c, status: 'Archived' } : c)
          );
        }
      })
      .addCase(archiveAdminCourse.rejected, failAction)

      .addCase(deleteAdminCourse.pending, startAction)
      .addCase(deleteAdminCourse.fulfilled, (state, action) => {
        state.actionLoading = false;
        const id = action.payload;
        if (state.selectedAdminCourse.data?.id === id) {
          state.selectedAdminCourse.data = null;
        }
        if (state.adminCourses.data?.items) {
          state.adminCourses.data.items = state.adminCourses.data.items.filter(
            (c) => c.id !== id
          );
        }
      })
      .addCase(deleteAdminCourse.rejected, failAction)

      .addCase(clearSession, () => initialState);
  },
});

export default coursesSlice.reducer;
