import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  enrollFreeCourse,
  fetchLearningContent,
  fetchStudentEnrollments,
  resetPlayer,
  setCurrentLessonId,
  updateLessonProgress,
} from '../actions/enrollmentsActions';
import { createResourceState } from '../utils';

const initialPlayer = {
  course: null,
  enrollment: null,
  lessons: [],
  assessment: null,
  currentLessonId: null,
  loading: true,
  notEnrolled: false,
  saving: false,
  error: '',
};

const initialState = {
  ...createResourceState([]),
  actionLoading: false,
  progressMutation: null,
  player: initialPlayer,
};

// Only predict lesson completion and progress; the server confirms course
// status, certificates and timestamps.
function optimisticProgress(enrollment, lessons, lessonId, completed) {
  const ids = new Set(lessons.map((lesson) => String(lesson.id)));
  if (!ids.has(String(lessonId))) return null;
  const done = new Set(
    (enrollment.completedLessons || []).map(String).filter((id) => ids.has(id))
  );
  if (completed) done.add(String(lessonId));
  else done.delete(String(lessonId));
  return {
    completedLessons: [...done],
    progress: Math.round((done.size / ids.size) * 100),
  };
}

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setCurrentLessonId, (state, action) => {
        state.player.currentLessonId = action.payload;
      })
      .addCase(resetPlayer, (state) => {
        state.player = { ...initialPlayer };
      })

      .addCase(fetchStudentEnrollments.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchStudentEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStudentEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          'Unable to load enrollments.';
      })

      .addCase(enrollFreeCourse.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(enrollFreeCourse.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload?.id && Array.isArray(state.data)) {
          state.data = [
            action.payload,
            ...state.data.filter((e) => e.id !== action.payload.id),
          ];
        }
      })
      .addCase(enrollFreeCourse.rejected, (state) => {
        state.actionLoading = false;
      })

      .addCase(fetchLearningContent.pending, (state) => {
        state.player.loading = true;
        state.player.error = '';
        state.player.notEnrolled = false;
      })
      .addCase(fetchLearningContent.fulfilled, (state, action) => {
        const data = action.payload || {};
        state.player.loading = false;
        state.player.course = data.course || null;
        state.player.enrollment = data.enrollment || null;
        state.player.lessons = Array.isArray(data.lessons) ? data.lessons : [];
        state.player.assessment = data.assessment || null;

        const done = new Set(
          (data.enrollment?.completedLessons || []).map(String)
        );
        const lessons = state.player.lessons;
        if (
          lessons.length > 0 &&
          (!state.player.currentLessonId ||
            !lessons.some((l) => l.id === state.player.currentLessonId))
        ) {
          const next = lessons.find((l) => !done.has(l.id)) || lessons[0];
          state.player.currentLessonId = next.id;
        }
      })
      .addCase(fetchLearningContent.rejected, (state, action) => {
        const payload = action.payload || {};
        state.player.loading = false;
        state.player.error =
          payload.message || action.error?.message || 'Unable to load course.';
        state.player.notEnrolled =
          payload.status === 403 || payload.status === 404;
        state.player.course = null;
        state.player.enrollment = null;
        state.player.lessons = [];
      })

      .addCase(updateLessonProgress.pending, (state, action) => {
        state.player.saving = true;
        const { enrollmentId, lessonId, completed } = action.meta.arg;
        const enrollment = state.player.enrollment;
        const listEntry = state.data.find((entry) => entry.id === enrollmentId);
        state.progressMutation = {
          requestId: action.meta.requestId,
          enrollmentId,
          player:
            enrollment?.id === enrollmentId
              ? {
                  completedLessons: enrollment.completedLessons,
                  progress: enrollment.progress,
                }
              : null,
          list: listEntry
            ? {
                completedLessons: listEntry.completedLessons,
                progress: listEntry.progress,
              }
            : null,
        };
        if (enrollment?.id !== enrollmentId) return;
        const changes = optimisticProgress(
          enrollment,
          state.player.lessons,
          lessonId,
          completed
        );
        if (!changes) return;
        Object.assign(enrollment, changes);
        if (listEntry) Object.assign(listEntry, changes);
      })
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        if (state.progressMutation?.requestId !== action.meta.requestId) return;
        state.progressMutation = null;
        state.player.saving = false;
        const updated = action.payload;
        if (!updated) return;
        if (state.player.enrollment?.id === updated.id)
          state.player.enrollment = updated;
        if (Array.isArray(state.data)) {
          state.data = state.data.map((e) =>
            e.id === updated.id ? { ...e, ...updated } : e
          );
        }
      })
      .addCase(updateLessonProgress.rejected, (state, action) => {
        const previous = state.progressMutation;
        if (previous?.requestId !== action.meta.requestId) return;
        if (
          previous.player &&
          state.player.enrollment?.id === previous.enrollmentId
        )
          Object.assign(state.player.enrollment, previous.player);
        const entry = state.data.find(
          (item) => item.id === previous.enrollmentId
        );
        if (entry && previous.list) Object.assign(entry, previous.list);
        state.progressMutation = null;
        state.player.saving = false;
      })

      .addCase(clearSession, () => initialState);
  },
});

export default enrollmentsSlice.reducer;
