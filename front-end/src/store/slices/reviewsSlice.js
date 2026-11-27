import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  clearReviewError,
  createReview,
  deleteReview,
  deleteReviewReply,
  fetchCourseReviews,
  fetchInstructorReviews,
  fetchMyReviews,
  replyToReview,
  updateReview,
} from '../actions/reviewsActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  courseReviews: createResourceState([]),
  myReviews: createResourceState([]),
  instructorReviews: createResourceState([]),
  saving: false,
  actionError: '',
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(builder, fetchCourseReviews, (s) => s.courseReviews);
    bindResourceLifecycle(builder, fetchMyReviews, (s) => s.myReviews);
    bindResourceLifecycle(
      builder,
      fetchInstructorReviews,
      (s) => s.instructorReviews
    );

    const startSaving = (state) => {
      state.saving = true;
      state.actionError = '';
    };
    const failSaving = (state, action) => {
      state.saving = false;
      state.actionError =
        action.payload || action.error?.message || 'Review action failed.';
    };

    builder
      .addCase(clearReviewError, (state) => {
        state.actionError = '';
      })

      .addCase(createReview.pending, startSaving)
      .addCase(createReview.fulfilled, (state, action) => {
        state.saving = false;
        const created = action.payload;
        if (created?.id) {
          if (Array.isArray(state.myReviews.data)) {
            state.myReviews.data = [
              created,
              ...state.myReviews.data.filter((r) => r.id !== created.id),
            ];
          }
          if (
            Array.isArray(state.courseReviews.data) &&
            !state.courseReviews.data.some((r) => r.id === created.id)
          ) {
            state.courseReviews.data = [created, ...state.courseReviews.data];
          }
        }
      })
      .addCase(createReview.rejected, failSaving)

      .addCase(updateReview.pending, startSaving)
      .addCase(updateReview.fulfilled, (state, action) => {
        state.saving = false;
        const { reviewId, rating, comment, updated } = action.payload;
        const applyPatch = (list) =>
          Array.isArray(list)
            ? list.map((r) =>
                r.id === reviewId
                  ? { ...r, ...(updated || { rating, comment }) }
                  : r
              )
            : list;
        state.myReviews.data = applyPatch(state.myReviews.data);
        state.courseReviews.data = applyPatch(state.courseReviews.data);
      })
      .addCase(updateReview.rejected, failSaving)

      .addCase(deleteReview.pending, startSaving)
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.saving = false;
        const id = action.payload;
        if (Array.isArray(state.myReviews.data)) {
          state.myReviews.data = state.myReviews.data.filter(
            (r) => r.id !== id
          );
        }
        if (Array.isArray(state.courseReviews.data)) {
          state.courseReviews.data = state.courseReviews.data.filter(
            (r) => r.id !== id
          );
        }
      })
      .addCase(deleteReview.rejected, failSaving)

      .addCase(replyToReview.pending, startSaving)
      .addCase(replyToReview.fulfilled, (state, action) => {
        state.saving = false;
        const { id, response, updated } = action.payload;
        if (Array.isArray(state.instructorReviews.data)) {
          state.instructorReviews.data = state.instructorReviews.data.map(
            (r) => (r.id === id ? { ...r, ...(updated || { response }) } : r)
          );
        }
      })
      .addCase(replyToReview.rejected, failSaving)

      .addCase(deleteReviewReply.pending, startSaving)
      .addCase(deleteReviewReply.fulfilled, (state, action) => {
        state.saving = false;
        const id = action.payload;
        if (Array.isArray(state.instructorReviews.data)) {
          state.instructorReviews.data = state.instructorReviews.data.map(
            (r) => (r.id === id ? { ...r, response: null, repliedAt: null } : r)
          );
        }
      })
      .addCase(deleteReviewReply.rejected, failSaving)

      .addCase(clearSession, () => initialState);
  },
});

export default reviewsSlice.reducer;
