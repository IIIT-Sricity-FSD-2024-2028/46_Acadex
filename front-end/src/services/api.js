/**
 * Unified Backend API Client Service for Acadex education platform
 * Supports all 4 platform actors: Student, Instructor, Organization, Admin
 * Uses Vite's /api proxy in development, or VITE_API_URL when configured.
 */

import {
  responseCached,
  cacheInvalidated,
} from '../store/slices/apiCacheSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let readAuthState = () => null;
let dispatchCache = () => {};
const inFlight = new Map();
export function attachStore(getStateFn, dispatch) {
  readAuthState = typeof getStateFn === 'function' ? getStateFn : () => null;
  dispatchCache = typeof dispatch === 'function' ? dispatch : () => {};
  inFlight.clear();
}

function getAuthValue(key) {
  const auth = readAuthState()?.auth;
  if (auth && Object.prototype.hasOwnProperty.call(auth, key)) {
    return auth[key];
  }
  return localStorage.getItem(key);
}

async function request(endpoint, options = {}) {
  const token =
    getAuthValue('nexuspay_auth_token') ||
    getAuthValue('auth_token') ||
    getAuthValue('nexuspay_student_token');
  const role =
    options.role ||
    getAuthValue('nexuspay_active_role') ||
    getAuthValue('user_role') ||
    'Student';

  const userId =
    getAuthValue('user_id') || getAuthValue('nexuspay_user_id') || '';
  const userEmail =
    getAuthValue('user_email') || getAuthValue('nexuspay_user_email') || '';
  const orgId = getAuthValue('user_organization_id');

  const headers = {
    'Content-Type': 'application/json',
    'x-role': role.toLowerCase(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'x-user-id': userId } : {}),
    ...(userEmail ? { 'x-user-email': userEmail } : {}),
    ...(orgId ? { 'x-organization-id': orgId } : {}),
    ...(options.headers || {}),
  };

  if (options.body instanceof FormData) delete headers['Content-Type'];

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const config = {
    ...options,
    headers,
  };

  if (
    options.body &&
    typeof options.body === 'object' &&
    !(options.body instanceof FormData)
  ) {
    config.body = JSON.stringify(options.body);
  }

  const method = (options.method || 'GET').toUpperCase();
  const cache = readAuthState()?.apiCache;
  const cacheable = method === 'GET' && cache && !options.signal;
  // Do not store authorization credentials in cache keys. Session changes
  // invalidate the whole cache; explicit role and identity headers distinguish
  // requests within a session.
  const key = JSON.stringify([
    url,
    Object.entries(headers)
      .filter(([name]) => name.toLowerCase() !== 'authorization')
      .sort(([a], [b]) => a.localeCompare(b)),
  ]);
  if (cacheable && Object.hasOwn(cache.entries, key)) {
    return cache.entries[key];
  }

  const flightKey = cacheable ? `${cache.generation}:${key}` : null;
  if (flightKey && inFlight.has(flightKey)) return inFlight.get(flightKey);

  const performRequest = async () => {
    try {
      const response = await fetch(url, config);
      const result =
        response.status === 204
          ? null
          : await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          result?.message || result?.error || `HTTP error ${response.status}`;
        const err = new Error(
          Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        );
        err.status = response.status;
        err.data = result;
        throw err;
      }

      // Unpack TransformResponseInterceptor format if present
      const data =
        result && typeof result === 'object' && 'data' in result
          ? result.data
          : result;
      const current = readAuthState()?.apiCache;
      if (cache && current?.sessionVersion !== cache.sessionVersion) {
        throw new Error('The session changed while the request was running.');
      }
      if (method !== 'GET' && method !== 'HEAD') {
        // Invalidate before returning so any follow-up reads in a mutation thunk
        // fetch fresh data, including related lists and dashboard aggregates.
        dispatchCache(cacheInvalidated());
      } else if (cacheable) {
        if (current.generation !== cache.generation) {
          return request(endpoint, options);
        }
        dispatchCache(
          responseCached({ key, data, generation: cache.generation })
        );
      }
      return data;
    } catch (error) {
      console.warn(
        `API request notice [${options.method || 'GET'} ${endpoint}]:`,
        error.message
      );
      throw error;
    }
  };

  const pending = performRequest();
  if (!flightKey) return pending;
  inFlight.set(flightKey, pending);
  try {
    return await pending;
  } finally {
    if (inFlight.get(flightKey) === pending) inFlight.delete(flightKey);
  }
}

export const api = {
  // 1. Authentication & Session
  auth: {
    login: (email, password, role) =>
      request('/auth/login', {
        method: 'POST',
        body: { email, password, role },
      }),
    register: (data) =>
      request('/auth/register', { method: 'POST', body: data }),
    getMe: (userId) =>
      request('/auth/me', { headers: { 'x-user-id': userId } }),
    changePassword: (currentPassword, newPassword, userId) =>
      request('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
        headers: { 'x-user-id': userId },
      }),
    requestPasswordReset: (email) =>
      request('/auth/password-reset/request', {
        method: 'POST',
        body: { email },
      }),
    resetPassword: (email, code, newPassword) =>
      request('/auth/password-reset/confirm', {
        method: 'POST',
        body: { email, code, newPassword },
      }),
  },

  // 2. Student / Learner LMS (x-user-id header is attached by request())
  student: {
    getProfile: () => request('/student/profile'),
    updateProfile: (data) =>
      request('/student/profile', { method: 'PUT', body: data }),
    getOrganizations: () => request('/student/organizations'),
    joinOrganization: (organizationId, organizationName) =>
      request('/student/join-organization', {
        method: 'POST',
        body: { organizationId, organizationName },
      }),
    getCatalog: () => request('/student/catalog'),
    getCatalogCourse: (courseId) => request(`/student/catalog/${courseId}`),
    getEnrollments: () => request('/student/enrollments'),
    getEnrollmentForCourse: (courseId) =>
      request(`/student/enrollments/course/${courseId}`),
    enrollFree: (courseId) =>
      request('/student/enrollments', { method: 'POST', body: { courseId } }),
    updateProgress: (enrollmentId, lessonId, completed) =>
      request(`/student/enrollments/${enrollmentId}/progress`, {
        method: 'PATCH',
        body: { lessonId, completed },
      }),
    getCertificates: () => request('/student/certificates'),
    getPayments: () => request('/student/payments'),
    checkout: (payload) =>
      request('/student/payments/checkout', { method: 'POST', body: payload }),
    getMyReviews: () => request('/reviews/my'),
    getMyDisputes: () => request('/student/disputes'),
    createDispute: (data) =>
      request('/student/disputes', { method: 'POST', body: data }),
    addDisputeComment: (disputeId, message) =>
      request(`/student/disputes/${disputeId}/comments`, {
        method: 'POST',
        body: { message },
      }),
  },

  // 3. Courses, Modules, Lessons & Curriculum
  courses: {
    list: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/courses${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/courses/${id}`),
    create: (data) => request('/courses', { method: 'POST', body: data }),
    update: (id, data) =>
      request(`/courses/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
    getReviews: (id) => request(`/reviews/course/${id}`),
    addReview: (courseId, rating, comment, learnerName, learnerId) =>
      request('/reviews', {
        method: 'POST',
        body: { courseId, rating, comment, learnerName, learnerId },
      }),
    updateReview: (reviewId, rating, comment) =>
      request(`/reviews/${reviewId}`, {
        method: 'PATCH',
        body: { rating, comment },
      }),
    deleteReview: (reviewId) =>
      request(`/reviews/${reviewId}`, { method: 'DELETE' }),
  },

  // 4. Quizzes & Academic Assessments
  quizzes: {
    list: () => request('/quizzes'),
    get: (id) => request(`/quizzes/${id}`),
    getByCourse: (courseId) => request(`/quizzes/course/${courseId}`),
    create: (data) => request('/quizzes', { method: 'POST', body: data }),
    addQuestion: (data) =>
      request('/quizzes/questions', { method: 'POST', body: data }),
    submit: (quizId, answers, userId) =>
      request(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: { answers },
        headers: { 'x-user-id': userId },
      }),
  },

  // 6. Certificates & Credentials
  certificates: {
    list: () => request('/certificates'),
    get: (id) => request(`/certificates/${id}`),
    verify: (credentialId) => request(`/certificates/verify/${credentialId}`),
    issue: (data) => request('/certificates', { method: 'POST', body: data }),
  },

  // 7. Organization Administration
  organization: {
    get: () => request('/organization'),
    update: (data) => request('/organization', { method: 'PATCH', body: data }),
    getStats: () => request('/organization/stats'),
    syncCounts: () => request('/organization/sync-counts', { method: 'POST' }),
    getStudentRequests: () => request('/organization/student-requests'),
    respondStudentRequest: (learnerId, action) =>
      request(`/organization/student-requests/${learnerId}/respond`, {
        method: 'POST',
        body: { action },
      }),
    listInstitutions: () => request('/organizations'),
    verifyInstitution: (id, data) =>
      request(`/organizations/${id}/verify`, { method: 'PATCH', body: data }),
  },

  // 8. Instructors & Teaching Faculty
  instructors: {
    list: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/instructors${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/instructors/${id}`),
    create: (data) => request('/instructors', { method: 'POST', body: data }),
    update: (id, data) =>
      request(`/instructors/${id}`, { method: 'PATCH', body: data }),
    leaveOrganization: (id) =>
      request(`/instructors/${id}/leave-organization`, { method: 'POST' }),
    getCourses: (id) => request(`/instructors/${id}/courses`),
    getRequests: (params) => {
      const query = params ? new URLSearchParams(params).toString() : '';
      return request(`/instructor-requests${query ? `?${query}` : ''}`);
    },
    respondRequest: (id, action, notes) =>
      request(`/instructor-requests/${id}/respond`, {
        method: 'PATCH',
        body: { decision: action, notes },
      }),
  },

  // 8b. Instructor Requests
  instructorRequests: {
    list: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/instructor-requests${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/instructor-requests/${id}`),
    create: (data) =>
      request('/instructor-requests', { method: 'POST', body: data }),
    respond: (id, action, notes) =>
      request(`/instructor-requests/${id}/respond`, {
        method: 'PATCH',
        body: { decision: action, notes },
      }),
    resend: (id) =>
      request(`/instructor-requests/${id}/resend`, { method: 'POST' }),
    withdraw: (id, reason) =>
      request(`/instructor-requests/${id}/withdraw`, {
        method: 'PATCH',
        body: { reason },
      }),
    myJoinRequests: () => request('/instructor-requests/join/mine'),
    requestToJoin: (organizationId, message) =>
      request('/instructor-requests/join', {
        method: 'POST',
        body: { organizationId, message },
      }),
    cancelJoinRequest: (id) =>
      request(`/instructor-requests/join/${id}/cancel`, { method: 'PATCH' }),
    incomingJoinRequests: () => request('/instructor-requests/join/incoming'),
    decideJoinRequest: (id, action, notes) =>
      request(`/instructor-requests/join/${id}/decide`, {
        method: 'PATCH',
        body: { action, notes },
      }),
  },

  // 8c. Learners Management
  learners: {
    list: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/learners${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/learners/${id}`),
    create: (data) => request('/learners', { method: 'POST', body: data }),
    update: (id, data) =>
      request(`/learners/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/learners/${id}`, { method: 'DELETE' }),
    getEnrollments: (id) => request(`/learners/${id}/enrollments`),
  },

  // 8d. Enrollments
  enrollments: {
    list: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/enrollments${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/enrollments/${id}`),
    create: (data) => request('/enrollments', { method: 'POST', body: data }),
    assign: (courseIds, learnerIds) =>
      request('/enrollments/assign', {
        method: 'POST',
        body: { courseIds, learnerIds },
      }),
    update: (id, data) =>
      request(`/enrollments/${id}`, { method: 'PATCH', body: data }),
  },

  // 9. Platform Admin & User Management
  users: {
    list: () => request('/users'),
    get: (id) => request(`/users/${id}`),
    create: (data) => request('/users', { method: 'POST', body: data }),
    update: (id, data) =>
      request(`/users/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  },

  // 10. Financial Settlements & Payments
  payments: {
    listTransactions: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/payments/transactions${query ? `?${query}` : ''}`);
    },
    getSummary: () => request('/payments/summary'),
  },

  // 11. Disputes & Governance
  disputes: {
    list: () => request('/disputes?limit=1000'),
    get: (id) => request(`/disputes/${id}`),
    raise: (data) => request('/disputes', { method: 'POST', body: data }),
    create: (data) => request('/disputes', { method: 'POST', body: data }),
    updateStatus: (id, status, notes) =>
      request(`/disputes/${id}/status`, {
        method: 'PATCH',
        body: { status, adminNote: notes },
      }),
    resolve: (id, resolutionNotes) =>
      request(`/disputes/${id}/resolve`, {
        method: 'PATCH',
        body: { resolutionNote: resolutionNotes },
      }),
  },

  // 12. Reports & Analytics Telemetry
  reports: {
    list: () => request('/reports'),
    generate: (data) =>
      request('/reports/generate', { method: 'POST', body: data }),
    exportCsv: (id) => request(`/reports/${id}/export`),
  },
  analytics: {
    getOverview: () =>
      request(
        (getAuthValue('nexuspay_active_role') || '').toLowerCase() ===
          'organization'
          ? '/analytics/organization'
          : '/analytics/overview'
      ),
    getSuperAdmin: () => request('/analytics/super-admin'),
    getInstructor: () => request('/analytics/instructor'),
    getTimeframe: (tf) => request(`/analytics/timeframe/${tf}`),
  },

  // 13. Notifications & System Settings
  notifications: {
    list: (params = {}) =>
      request(
        `/notifications?${new URLSearchParams({ limit: 1000, ...params })}`
      ),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      request('/notifications/mark-all-read', { method: 'PATCH' }),
  },
  settings: {
    get: () => request('/settings'),
    update: (data) => request('/settings', { method: 'PATCH', body: data }),
    resetDatabase: () =>
      request('/settings/reset-database', { method: 'POST' }),
  },

  // All actors read and write the backend JSON database.
  superAdmin: {
    getAnalytics: () => request('/analytics/super-admin'),
    getAdmins: () => request('/users?role=Admin'),
    createAdmin: (data) =>
      request('/users', { method: 'POST', body: { ...data, role: 'Admin' } }),
    updateAdmin: (id, data) =>
      request(`/users/${id}`, { method: 'PATCH', body: data }),
    deleteAdmin: (id) => request(`/users/${id}`, { method: 'DELETE' }),
    getEscalations: (params = {}) =>
      request(`/disputes?${new URLSearchParams({ limit: 1000, ...params })}`),
    updateEscalationStatus: (id, status, notes) =>
      request(`/disputes/${id}/status`, {
        method: 'PATCH',
        body: { status, adminNote: notes },
      }),
    resolveEscalation: (id, resolutionNotes) =>
      request(`/disputes/${id}/resolve`, {
        method: 'PATCH',
        body: { resolutionNote: resolutionNotes },
      }),
    deleteEscalation: (id) => request(`/disputes/${id}`, { method: 'DELETE' }),
    getOrganizations: () => request('/organizations'),
    getOrganization: (id) => request(`/organizations/${id}`),
    createOrganization: (data) =>
      request('/organizations', { method: 'POST', body: data }),
    updateOrganization: (id, data) =>
      request(`/organizations/${id}`, { method: 'PATCH', body: data }),
    deleteOrganization: (id) =>
      request(`/organizations/${id}`, { method: 'DELETE' }),
    getLearners: (params = {}) =>
      request(`/learners?${new URLSearchParams({ limit: 1000, ...params })}`),
    updateLearner: (id, data) =>
      request(`/learners/${id}`, { method: 'PATCH', body: data }),
    deleteLearner: (id) => request(`/learners/${id}`, { method: 'DELETE' }),
    suspendLearner: async (id) => {
      const learner = await request(`/learners/${id}`);
      return request(`/learners/${id}`, {
        method: 'PATCH',
        body: {
          status: learner.status === 'Suspended' ? 'Active' : 'Suspended',
        },
      });
    },
    createLearner: (data) =>
      request('/learners', { method: 'POST', body: data }),
    getInstructors: () => request('/instructors?limit=1000'),
    createInstructor: (data) =>
      request('/instructors', { method: 'POST', body: data }),
    updateInstructor: (id, data) =>
      request(`/instructors/${id}`, { method: 'PATCH', body: data }),
    deleteInstructor: (id) =>
      request(`/instructors/${id}`, { method: 'DELETE' }),
    getCourses: () => request('/courses?limit=1000'),
    getSystemLogs: () => request('/analytics/super-admin'),
    getTransactions: (params = {}) =>
      request(
        `/payments/transactions?${new URLSearchParams({ limit: 1000, ...params })}`
      ),
    getAdminResolutions: () => request('/users/activity'),
    recordAdminResolution: (data) =>
      request('/users/activity', { method: 'POST', body: data }),
  },

  // 15. Generic HTTP Methods (Backward-compatible with src/utils/api.js)
  get: (endpoint, role) =>
    request(endpoint, { method: 'GET', ...(role ? { role } : {}) }),
  post: (endpoint, body, role) =>
    request(endpoint, { method: 'POST', body, ...(role ? { role } : {}) }),
  put: (endpoint, body, role) =>
    request(endpoint, { method: 'PUT', body, ...(role ? { role } : {}) }),
  patch: (endpoint, body, role) =>
    request(endpoint, { method: 'PATCH', body, ...(role ? { role } : {}) }),
  delete: (endpoint, role) =>
    request(endpoint, { method: 'DELETE', ...(role ? { role } : {}) }),
  getItems: (result) => {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (Array.isArray(result.items)) return result.items;
    return [];
  },
};

export const getItems = api.getItems;
export default api;
