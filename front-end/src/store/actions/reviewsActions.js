import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { fetchStudentCatalogCourse } from './coursesActions';
import { extractItems } from '../utils';

export const clearReviewError = createAction('reviews/clearReviewError');

export const fetchCourseReviews = createAsyncThunk(
  'reviews/fetchCourseReviews',
  async (courseId, { rejectWithValue }) => {
    try {
      const list = await api.courses.getReviews(courseId);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load reviews.');
    }
  }
);

export const fetchMyReviews = createAsyncThunk(
  'reviews/fetchMyReviews',
  async (_, { rejectWithValue }) => {
    try {
      return extractItems(await api.student.getMyReviews());
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load your reviews.');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async (
    {
      courseId,
      rating,
      comment,
      learnerName,
      learnerId,
      refreshCatalog = false,
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const created = await api.courses.addReview(
        courseId,
        rating,
        comment,
        learnerName,
        learnerId
      );
      if (refreshCatalog) {
        await Promise.allSettled([
          dispatch(fetchCourseReviews(courseId)),
          dispatch(fetchStudentCatalogCourse(courseId)),
        ]);
      }
      return created;
    } catch (err) {
      return rejectWithValue(err.message || 'Could not submit review.');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/update',
  async (
    { reviewId, rating, comment, courseId, refreshCatalog = false },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await api.courses.updateReview(reviewId, rating, comment);
      if (refreshCatalog && courseId) {
        await Promise.allSettled([
          dispatch(fetchCourseReviews(courseId)),
          dispatch(fetchStudentCatalogCourse(courseId)),
        ]);
      }
      return { reviewId, rating, comment, updated };
    } catch (err) {
      return rejectWithValue(err.message || 'Could not update review.');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (
    { reviewId, courseId, refreshCatalog = false },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await api.courses.deleteReview(reviewId);
      if (refreshCatalog && courseId) {
        await Promise.allSettled([
          dispatch(fetchCourseReviews(courseId)),
          dispatch(fetchStudentCatalogCourse(courseId)),
        ]);
      }
      return reviewId;
    } catch (err) {
      return rejectWithValue(err.message || 'Could not delete review.');
    }
  }
);

export const fetchInstructorReviews = createAsyncThunk(
  'reviews/fetchInstructorReviews',
  async (_, { rejectWithValue }) => {
    try {
      return extractItems(await api.get('/workspace/instructor/reviews'));
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load course reviews.');
    }
  }
);

export const replyToReview = createAsyncThunk(
  'reviews/reply',
  async ({ id, response }, { rejectWithValue }) => {
    try {
      const updated = await api.post(
        `/workspace/instructor/reviews/${encodeURIComponent(id)}/reply`,
        { response }
      );
      return { id, response, updated };
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to save reply.');
    }
  }
);

export const deleteReviewReply = createAsyncThunk(
  'reviews/deleteReply',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(
        `/workspace/instructor/reviews/${encodeURIComponent(id)}/reply`
      );
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to delete reply.');
    }
  }
);
