import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { syncOrgCounts } from './organizationsActions';

export const clearCourseErrors = createAction('courses/clearCourseErrors');
export const clearSelectedCatalogCourse = createAction(
  'courses/clearSelectedCatalogCourse'
);

export const fetchPublicLanding = createAsyncThunk(
  'courses/fetchPublicLanding',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get('/public/landing');
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load landing courses.');
    }
  }
);

export const fetchStudentCatalog = createAsyncThunk(
  'courses/fetchStudentCatalog',
  async (_, { rejectWithValue }) => {
    try {
      const list = await api.student.getCatalog();
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load catalog.');
    }
  }
);

export const browseStudentCatalog = createAsyncThunk(
  'courses/browseStudentCatalog',
  async ({ search = '', page = '1', limit = 9 } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams({ search, page, limit });
      return await api.get(`/student/catalog/browse?${query}`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to browse courses.');
    }
  }
);

export const fetchStudentCatalogCourse = createAsyncThunk(
  'courses/fetchStudentCatalogCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      return await api.student.getCatalogCourse(courseId);
    } catch (err) {
      return rejectWithValue(err.message || 'Course not available.');
    }
  }
);

export const fetchOrgCourses = createAsyncThunk(
  'courses/fetchOrgCourses',
  async (search = '', { rejectWithValue }) => {
    try {
      return await api.get(
        `/courses/organization/list?${new URLSearchParams({ search })}`
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load courses.');
    }
  }
);

export const fetchOrgCourseById = createAsyncThunk(
  'courses/fetchOrgCourseById',
  async (id, { rejectWithValue }) => {
    try {
      return await api.get(`/courses/${encodeURIComponent(id)}/organization`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load course details.');
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const created = await api.courses.create(payload);
      dispatch(syncOrgCounts());
      return created;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create course.');
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const payload = {
        ...data,
        ...(data.price === undefined ? {} : { price: Number(data.price) }),
      };
      const updated = await api.courses.update(id, payload);
      dispatch(syncOrgCounts());
      return { id, updated: updated || payload };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update course.');
    }
  }
);

export const submitCourseForApproval = createAsyncThunk(
  'courses/submitForApproval',
  async (id, { rejectWithValue }) => {
    try {
      await api.post(`/courses/${encodeURIComponent(id)}/submit`, {});
      return await api.get(`/courses/${encodeURIComponent(id)}/organization`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to submit course.');
    }
  }
);

export const fetchAssignmentOptions = createAsyncThunk(
  'courses/fetchAssignmentOptions',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get('/courses/assignment-options');
    } catch (err) {
      return rejectWithValue(
        err.message || 'Unable to load assignment options.'
      );
    }
  }
);

export const assignCourseInstructors = createAsyncThunk(
  'courses/assignInstructors',
  async ({ courseIds, instructorIds }, { rejectWithValue }) => {
    try {
      return await api.post('/courses/assignments', {
        courseIds,
        instructorIds,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to assign instructors.');
    }
  }
);

export const fetchAdminCourseQueue = createAsyncThunk(
  'courses/fetchAdminCourseQueue',
  async (search = '', { rejectWithValue }) => {
    try {
      return await api.get(
        `/admin/course-queue?${new URLSearchParams({ search })}`
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load course queue.');
    }
  }
);

export const fetchAdminCourses = createAsyncThunk(
  'courses/fetchAdminCourses',
  async (
    { search = '', status = 'Pending Approval', page = 1, limit = 12 } = {},
    { rejectWithValue }
  ) => {
    try {
      return await api.get(
        `/admin/courses?${new URLSearchParams({ search, status, page, limit })}`
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load courses.');
    }
  }
);

export const fetchAdminCourseById = createAsyncThunk(
  'courses/fetchAdminCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      return await api.get(`/admin/courses/${encodeURIComponent(courseId)}`);
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load course details.');
    }
  }
);

export const reviewAdminCourse = createAsyncThunk(
  'courses/reviewAdminCourse',
  async ({ courseId, decision, reason }, { rejectWithValue }) => {
    try {
      await api.post(
        `/admin/courses/${encodeURIComponent(courseId)}/review`,
        {
          decision,
          ...(decision === 'reject' ? { reason } : {}),
        },
        'admin'
      );
      return { courseId, decision };
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to review course.');
    }
  }
);

export const updateAdminCourse = createAsyncThunk(
  'courses/updateAdminCourse',
  async ({ courseId, form }, { rejectWithValue }) => {
    try {
      const updated = await api.patch(
        `/admin/courses/${encodeURIComponent(courseId)}`,
        form
      );
      return { courseId, updated: updated || form };
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to update course.');
    }
  }
);

export const archiveAdminCourse = createAsyncThunk(
  'courses/archiveAdminCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      await api.post(
        `/admin/courses/${encodeURIComponent(courseId)}/archive`,
        {}
      );
      return courseId;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to archive course.');
    }
  }
);

export const deleteAdminCourse = createAsyncThunk(
  'courses/deleteAdminCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/courses/${encodeURIComponent(courseId)}`);
      return courseId;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to delete course.');
    }
  }
);
