import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { fetchStudentProfile } from './learnersActions';
import { fetchStudentCertificates } from './certificatesActions';

export const setCurrentLessonId = createAction(
  'enrollments/setCurrentLessonId'
);
export const resetPlayer = createAction('enrollments/resetPlayer');

export const fetchStudentEnrollments = createAsyncThunk(
  'enrollments/fetchStudent',
  async (_, { rejectWithValue }) => {
    try {
      const list = await api.student.getEnrollments();
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load enrollments.');
    }
  }
);

export const enrollFreeCourse = createAsyncThunk(
  'enrollments/enrollFree',
  async (courseId, { dispatch, rejectWithValue }) => {
    try {
      const created = await api.student.enrollFree(courseId);
      await Promise.allSettled([
        dispatch(fetchStudentEnrollments()),
        dispatch(fetchStudentProfile()),
      ]);
      return created;
    } catch (err) {
      return rejectWithValue(err.message || 'Could not enroll.');
    }
  }
);

export const fetchLearningContent = createAsyncThunk(
  'enrollments/fetchLearningContent',
  async (courseId, { rejectWithValue }) => {
    try {
      return await api.get(
        `/student/courses/${encodeURIComponent(courseId)}/content`
      );
    } catch (err) {
      return rejectWithValue({
        message: err.message || 'Unable to load course content.',
        status: err.status,
      });
    }
  }
);

export const updateLessonProgress = createAsyncThunk(
  'enrollments/updateProgress',
  async (
    { enrollmentId, lessonId, completed },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await api.student.updateProgress(
        enrollmentId,
        lessonId,
        completed
      );
      await Promise.allSettled([
        dispatch(fetchStudentEnrollments()),
        dispatch(fetchStudentProfile()),
        ...(updated?.status === 'Completed'
          ? [dispatch(fetchStudentCertificates())]
          : []),
      ]);
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Could not save progress.');
    }
  }
);

export const recordLearningActivity = createAsyncThunk(
  'enrollments/recordActivity',
  async ({ courseId, lessonId, seconds = 30 }) => {
    try {
      return await api.post(
        `/student/courses/${encodeURIComponent(courseId)}/activity`,
        {
          lessonId,
          seconds,
        }
      );
    } catch {
      return null;
    }
  }
);

export const assignCoursesToLearners = createAsyncThunk(
  'enrollments/assignToLearners',
  async ({ courseIds, learnerIds }, { rejectWithValue }) => {
    try {
      return await api.enrollments.assign(courseIds, learnerIds);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to assign courses.');
    }
  }
);
