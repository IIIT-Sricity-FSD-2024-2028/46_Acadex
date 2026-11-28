import { combineReducers, configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import toast from './slices/toastSlice';
import users from './slices/usersSlice';
import organizations from './slices/organizationsSlice';
import instructors from './slices/instructorsSlice';
import instructorRequests from './slices/instructorRequestsSlice';
import learners from './slices/learnersSlice';
import courses from './slices/coursesSlice';
import curriculum from './slices/curriculumSlice';
import enrollments from './slices/enrollmentsSlice';
import quizzes from './slices/quizzesSlice';
import reviews from './slices/reviewsSlice';
import disputes from './slices/disputesSlice';
import payments from './slices/paymentsSlice';
import certificates from './slices/certificatesSlice';
import notifications from './slices/notificationsSlice';
import analytics from './slices/analyticsSlice';
import settings from './slices/settingsSlice';
import apiCache, { cacheSessionChanged } from './slices/apiCacheSlice';
import { reduceOptimistic } from './optimisticUpdates';

const rootReducer = combineReducers({
  auth,
  toast,
  users,
  organizations,
  instructors,
  instructorRequests,
  learners,
  courses,
  curriculum,
  enrollments,
  quizzes,
  reviews,
  disputes,
  payments,
  certificates,
  notifications,
  analytics,
  settings,
  apiCache,
});

const sessionKeys = [
  'nexuspay_auth_token',
  'auth_token',
  'nexuspay_student_token',
  'user_id',
  'nexuspay_user_id',
  'user_role',
  'nexuspay_active_role',
  'user_email',
  'nexuspay_user_email',
  'user_organization_id',
];

const sessionChanged = (state, next, action) =>
  Boolean(
    state &&
    (action.type === 'auth/sessionCleared' ||
      sessionKeys.some((key) => state.auth[key] !== next.auth[key]))
  );

function reduceConfirmed(state, action) {
  const next = rootReducer(state, action);
  return sessionChanged(state, next, action)
    ? { ...next, apiCache: apiCache(next.apiCache, cacheSessionChanged()) }
    : next;
}

export const store = configureStore({
  reducer: (state, action) =>
    reduceOptimistic(state, action, reduceConfirmed, sessionChanged),
});
