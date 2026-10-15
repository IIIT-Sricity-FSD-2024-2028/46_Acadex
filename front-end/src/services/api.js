/**
 * Unified Backend API Client Service for NexusPay Enterprise EdTech Platform
 * Supports all 4 platform actors: Student, Instructor, Organization, Admin
 * Uses Vite's /api proxy in development, or VITE_API_URL when configured.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
import { jsonDataClient } from './jsonDataClient';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('nexuspay_auth_token') || localStorage.getItem('nexuspay_student_token');
  const role = options.role || localStorage.getItem('nexuspay_active_role') || 'Student';

  const userId = localStorage.getItem('user_id') || '';
  const userEmail = localStorage.getItem('user_email') || '';

  const headers = {
    'Content-Type': 'application/json',
    'x-role': role.toLowerCase(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'x-user-id': userId } : {}),
    ...(userEmail ? { 'x-user-email': userEmail } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    if (response.status === 204) return null;

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `HTTP error ${response.status}`;
      const err = new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
      err.status = response.status;
      err.data = result;
      throw err;
    }

    // Unpack TransformResponseInterceptor format if present
    return result && typeof result === 'object' && 'data' in result ? result.data : result;
  } catch (error) {
    console.warn(`API request notice [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
}

// ── Mock credential store (mirrors users.json) ──────────────────
const MOCK_CREDENTIALS = [
  { email: 'arjun.sharma@email.com',       password: 'Password123!', role: 'Student',      name: 'Arjun Sharma',            id: 'usr-5' },
  { email: 'sofia.reyes@email.com',        password: 'Password123!', role: 'Student',      name: 'Sofia Reyes',             id: 'usr-6' },
  { email: 'priya.nair@meridiantech.io',   password: 'Password123!', role: 'Instructor',   name: 'Priya Nair',              id: 'usr-1', instructorId: 'inst-1', organizationId: 'org-1', organizationName: 'Meridian Tech Institute' },
  { email: 'daniel.osei@meridiantech.io',  password: 'Password123!', role: 'Instructor',   name: 'Daniel Osei',             id: 'usr-2', instructorId: 'inst-2', organizationId: 'org-1', organizationName: 'Meridian Tech Institute' },
  { email: 'elena.vasquez@quantlearn.io',  password: 'Password123!', role: 'Instructor',   name: 'Elena Vasquez',           id: 'usr-3', instructorId: 'inst-3', organizationId: 'org-2', organizationName: 'QuantLearn Academy' },
  { email: 'james.holloway@quantlearn.io', password: 'Password123!', role: 'Instructor',   name: 'James Holloway',          id: 'usr-4', instructorId: 'inst-4', organizationId: 'org-2', organizationName: 'QuantLearn Academy' },
  { email: 'admin@meridiantech.io',        password: 'Password123!', role: 'Organization', name: 'Meridian Tech Institute', id: 'usr-7', organizationId: 'org-1', organizationName: 'Meridian Tech Institute' },
  { email: 'admin@quantlearn.io',          password: 'Password123!', role: 'Organization', name: 'QuantLearn Academy',      id: 'usr-8', organizationId: 'org-2', organizationName: 'QuantLearn Academy' },
  { email: 'admin@platform.io',            password: 'Password123!', role: 'Admin',        name: 'Platform Admin',          id: 'usr-9' },
  { email: 'superadmin@platform.io',       password: 'Password123!', role: 'SuperAdmin',   name: 'Platform Super Admin',    id: 'usr-10' },
];

function mockLogin(email, password, role) {
  const normRole = (r) => String(r || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  const targetRole = normRole(role);

  const match = MOCK_CREDENTIALS.find(
    (c) =>
      c.email.toLowerCase() === email.toLowerCase() &&
      c.password === password &&
      (normRole(c.role) === targetRole || (normRole(c.role) === 'superadmin' && targetRole === 'admin'))
  );
  if (!match) {
    const err = new Error('Invalid credentials. Please check your email and password.');
    err.status = 401;
    throw err;
  }
  const resolvedRole = targetRole === 'superadmin' ? 'SuperAdmin' : match.role;
  return {
    token: `jwt-mock-${resolvedRole.toLowerCase()}-${Date.now()}`,
    user: {
      id: match.id,
      email: match.email,
      name: match.name,
      role: resolvedRole,
      ...(match.instructorId ? { instructorId: match.instructorId } : {}),
      ...(match.organizationId ? { organizationId: match.organizationId } : {}),
      ...(match.organizationName ? { organizationName: match.organizationName } : {}),
    },
  };
}

export const api = {
  // 1. Authentication & Session
  auth: {
    login: (email, password, role) =>
      request('/auth/login', { method: 'POST', body: { email, password, role } }).catch(() =>
        mockLogin(email, password, role)
      ),
    register: (data) => request('/auth/register', { method: 'POST', body: data }),
    getMe: (userId) => request('/auth/me', { headers: { 'x-user-id': userId } }),
    changePassword: (currentPassword, newPassword, userId) =>
      request('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
        headers: { 'x-user-id': userId },
      }),
    requestPasswordReset: (email) =>
      request('/auth/password-reset/request', { method: 'POST', body: { email } }),
    resetPassword: (email, code, newPassword) =>
      request('/auth/password-reset/confirm', {
        method: 'POST',
        body: { email, code, newPassword },
      }),
  },

  // 2. Student / Learner LMS
  student: {
    getProfile: (userId) => request('/student/profile', { headers: { 'x-user-id': userId } }),
    updateProfile: (data, userId) => request('/student/profile', { method: 'PUT', body: data, headers: { 'x-user-id': userId } }),
    getOrganizations: () => request('/student/organizations'),
    joinOrganization: (organizationId, organizationName, userId) =>
      request('/student/join-organization', {
        method: 'POST',
        body: { organizationId, organizationName },
        headers: { 'x-user-id': userId },
        
      }),
    getEnrollments: (userId) => request('/student/enrollments', { headers: { 'x-user-id': userId } }),
    enroll: (courseId, userId, extra = {}) => request('/student/enrollments', { method: 'POST', body: { courseId, ...extra }, headers: { 'x-user-id': userId } }),
    updateProgress: (enrollmentId, lessonId, completed, userId) =>
      request(`/student/enrollments/${enrollmentId}/progress`, {
        method: 'PATCH',
        body: { lessonId, completed },
        headers: { 'x-user-id': userId },
      }),
    getCertificates: (userId) => request('/student/certificates', { headers: { 'x-user-id': userId } }),
    getPayments: (userId) => request('/student/payments', { headers: { 'x-user-id': userId } }),
    checkout: (courseId, paymentMethod, amount, userId, extra = {}) =>
      request('/student/payments/checkout', {
        method: 'POST',
        body: { courseId, paymentMethod, amount, ...extra },
        headers: { 'x-user-id': userId },
      }),
  },

  // 3. Courses, Modules, Lessons & Curriculum
  courses: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/courses${query ? `?${query}` : ''}`).catch(() => {
        return jsonDataClient.getCourses();
      });
    },
    get: (id) =>
      request(`/courses/${id}`).catch(() => {
        const courses = jsonDataClient.getCourses();
        return courses.find((c) => c.id === id || String(c.id) === String(id)) || courses[0];
      }),
    create: (data) => request('/courses', { method: 'POST', body: data }),
    update: (id, data) => request(`/courses/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
    getReviews: (id) => request(`/reviews/course/${id}`),
    addReview: (courseId, rating, comment, learnerName) =>
      request('/reviews', { method: 'POST', body: { courseId, rating, comment, learnerName } }),
    updateReview: (reviewId, rating, comment) =>
      request(`/reviews/${reviewId}`, { method: 'PATCH', body: { rating, comment } }),
    deleteReview: (reviewId) => request(`/reviews/${reviewId}`, { method: 'DELETE' }),
  },

  // 3b. Bookmarks
  bookmarks: {
    list: () => request('/bookmarks'),
    toggle: (courseId) => request(`/bookmarks/${courseId}/toggle`, { method: 'POST' }),
    status: (courseId) => request(`/bookmarks/${courseId}/status`),
    remove: (courseId) => request(`/bookmarks/${courseId}`, { method: 'DELETE' }),
  },

  // 4. Quizzes & Academic Assessments
  quizzes: {
    list: () => request('/quizzes'),
    get: (id) => request(`/quizzes/${id}`),
    getByCourse: (courseId) => request(`/quizzes/course/${courseId}`),
    create: (data) => request('/quizzes', { method: 'POST', body: data }),
    addQuestion: (data) => request('/quizzes/questions', { method: 'POST', body: data }),
    submit: (quizId, answers, userId) =>
      request(`/quizzes/${quizId}/submit`, { method: 'POST', body: { answers }, headers: { 'x-user-id': userId } }),
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
    getStudentRequests: () => request('/organization/student-requests'),
    respondStudentRequest: (learnerId, action) =>
      request(`/organization/student-requests/${learnerId}/respond`, { method: 'POST', body: { action } }),
    listInstitutions: () => request('/organizations'),
    verifyInstitution: (id, data) => request(`/organizations/${id}/verify`, { method: 'PATCH', body: data }),
  },

  // 8. Instructors & Teaching Faculty
  instructors: {
    list: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/instructors${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/instructors/${id}`),
    create: (data) => request('/instructors', { method: 'POST', body: data }),
    update: (id, data) => request(`/instructors/${id}`, { method: 'PATCH', body: data }),
    connectOrganization: (id, organizationId, organizationName) =>
      request(`/instructors/${id}/connect-organization`, {
        method: 'POST',
        body: { organizationId, organizationName },
      }),
    getCourses: (id) => request(`/instructors/${id}/courses`),
    getRequests: (params) => {
      const query = params ? new URLSearchParams(params).toString() : '';
      return request(`/instructor-requests${query ? `?${query}` : ''}`);
    },
    respondRequest: (id, action, notes) =>
      request(`/instructor-requests/${id}/respond`, { method: 'PATCH', body: { decision: action, notes } }),
  },

  // 8b. Instructor Requests
  instructorRequests: {
    list: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/instructor-requests${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/instructor-requests/${id}`),
    create: (data) => request('/instructor-requests', { method: 'POST', body: data }),
    respond: (id, action, notes) =>
      request(`/instructor-requests/${id}/respond`, { method: 'PATCH', body: { decision: action, notes } }),
  },

  // 8c. Learners Management
  learners: {
    list: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/learners${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/learners/${id}`),
    create: (data) => request('/learners', { method: 'POST', body: data }),
    update: (id, data) => request(`/learners/${id}`, { method: 'PATCH', body: data }),
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
      request('/enrollments/assign', { method: 'POST', body: { courseIds, learnerIds } }),
    update: (id, data) => request(`/enrollments/${id}`, { method: 'PATCH', body: data }),
  },

  // 9. Platform Admin & User Management
  users: {
    list: () => request('/users'),
    get: (id) => request(`/users/${id}`),
    create: (data) => request('/users', { method: 'POST', body: data }),
    update: (id, data) => request(`/users/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  },

  // 10. Financial Settlements, Payments & Refunds
  payments: {
    listTransactions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/payments/transactions${query ? `?${query}` : ''}`);
    },
    getSummary: () => request('/payments/summary'),
    getRefunds: () => request('/refunds'),
    processRefund: (data) => request('/refunds', { method: 'POST', body: data }),
  },

  // 11. Disputes & Governance
  disputes: {
    list: () => request('/disputes'),
    get: (id) => request(`/disputes/${id}`),
    raise: (data) => request('/disputes', { method: 'POST', body: data }),
    create: (data) => request('/disputes', { method: 'POST', body: data }),
    updateStatus: (id, status, notes) =>
      request(`/disputes/${id}/status`, { method: 'PATCH', body: { status, adminNote: notes } }),
    resolve: (id, resolutionNotes) =>
      request(`/disputes/${id}/resolve`, { method: 'PATCH', body: { resolutionNote: resolutionNotes } }),
  },

  // 12. Reports & Analytics Telemetry
  reports: {
    list: () => request('/reports'),
    generate: (data) => request('/reports/generate', { method: 'POST', body: data }),
    exportCsv: (collection) => request(`/reports/export/${collection}`),
  },
  analytics: {
    getOverview: () => request('/analytics/overview'),
    getSuperAdmin: () => request('/analytics/super-admin'),
    getInstructor: () => request('/analytics/instructor'),
    getTimeframe: (tf) => request(`/analytics/timeframe/${tf}`),
  },

  // 13. Notifications & System Settings
  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/mark-all-read', { method: 'PATCH' }),
  },
  settings: {
    get: () => request('/settings'),
    update: (data) => request('/settings', { method: 'PATCH', body: data }),
    resetDatabase: () => request('/settings/reset-database', { method: 'POST' }),
  },

  // 14. Super Admin Governance (Level 1 Master Control - JSON backed with direct fallback)
  superAdmin: {
    getAnalytics: () =>
      request('/analytics/super-admin').catch(() => jsonDataClient.getSuperAdminAnalytics()),
    getAdmins: () =>
      request('/users?role=Admin').catch(() => jsonDataClient.getAdmins()),
    createAdmin: (data) =>
      request('/users', { method: 'POST', body: { ...data, role: 'Admin' } }).catch(() =>
        jsonDataClient.createAdmin(data)
      ),
    updateAdmin: (id, data) =>
      request(`/users/${id}`, { method: 'PATCH', body: data }).catch(() =>
        jsonDataClient.updateAdmin(id, data)
      ),
    deleteAdmin: (id) =>
      request(`/users/${id}`, { method: 'DELETE' }).catch(() =>
        jsonDataClient.deleteAdmin(id)
      ),

    getEscalations: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/disputes${query ? `?${query}` : ''}`).catch(() => {
        const items = jsonDataClient.getEscalations();
        return Array.isArray(items) ? items : items.items || [];
      });
    },
    updateEscalationStatus: (id, status, notes) =>
      request(`/disputes/${id}/status`, { method: 'PATCH', body: { status, adminNote: notes } }).catch(() =>
        jsonDataClient.updateEscalationStatus(id, status, notes)
      ),
    resolveEscalation: (id, resolutionNotes) =>
      request(`/disputes/${id}/resolve`, { method: 'PATCH', body: { resolutionNote: resolutionNotes } }).catch(() =>
        jsonDataClient.resolveEscalation(id, resolutionNotes)
      ),
    deleteEscalation: (id) =>
      request(`/disputes/${id}`, { method: 'DELETE' }).catch(() => {
        const disputes = jsonDataClient.getEscalations();
        const updated = disputes.filter((d) => d.id !== id);
        localStorage.setItem('nexuspay_json_db_disputes', JSON.stringify(updated));
        return { success: true };
      }),

    getOrganizations: () =>
      request('/organizations').catch(() => jsonDataClient.getOrganizations()),
    getOrganization: (id) =>
      request(`/organizations/${id}`).catch(() => {
        const orgs = jsonDataClient.getOrganizations();
        return orgs.find((o) => o.id === id);
      }),
    createOrganization: (data) =>
      request('/organizations', { method: 'POST', body: data }).catch(() =>
        jsonDataClient.createOrganization(data)
      ),
    updateOrganization: (id, data) =>
      request(`/organizations/${id}`, { method: 'PATCH', body: data }).catch(() =>
        jsonDataClient.updateOrganization(id, data)
      ),
    deleteOrganization: (id) =>
      request(`/organizations/${id}`, { method: 'DELETE' }).catch(() =>
        jsonDataClient.deleteOrganization(id)
      ),

    getLearners: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/learners${query ? `?${query}` : ''}`).catch(() => {
        const learners = jsonDataClient.getLearners();
        return Array.isArray(learners) ? learners : learners.items || [];
      });
    },
    updateLearner: (id, data) =>
      request(`/learners/${id}`, { method: 'PATCH', body: data }).catch(() =>
        jsonDataClient.updateLearner(id, data)
      ),
    deleteLearner: (id) =>
      request(`/learners/${id}`, { method: 'DELETE' }).catch(() =>
        jsonDataClient.deleteLearner(id)
      ),
    suspendLearner: (id, reason) =>
      request(`/learners/${id}/suspend`, { method: 'POST', body: { reason } }).catch(() =>
        jsonDataClient.suspendLearner(id, reason)
      ),
    createLearner: (data) =>
      request('/learners', { method: 'POST', body: data }).catch(() =>
        jsonDataClient.createLearner(data)
      ),

    getInstructors: () =>
      request('/instructors').catch(() => jsonDataClient.getInstructors()),
    createInstructor: (data) =>
      request('/instructors', { method: 'POST', body: data }).catch(() =>
        jsonDataClient.createInstructor(data)
      ),
    updateInstructor: (id, data) =>
      request(`/instructors/${id}`, { method: 'PATCH', body: data }).catch(() =>
        jsonDataClient.updateInstructor(id, data)
      ),
    deleteInstructor: (id) =>
      request(`/instructors/${id}`, { method: 'DELETE' }).catch(() =>
        jsonDataClient.deleteInstructor(id)
      ),
    getCourses: () =>
      request('/courses').catch(() => jsonDataClient.getCourses()),
    getSystemLogs: () =>
      request('/analytics/super-admin').catch(() => jsonDataClient.getSuperAdminAnalytics()),
    getTransactions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/payments/transactions${query ? `?${query}` : ''}`).catch(() => {
        const txs = jsonDataClient.getTransactions();
        return Array.isArray(txs) ? txs : (txs?.items || []);
      });
    },
    getAdminResolutions: () => {
      return Promise.resolve(jsonDataClient.getAdminResolutions());
    },
    recordAdminResolution: (data) => {
      return Promise.resolve(jsonDataClient.recordAdminResolution(data));
    },
  },

  // 15. Generic HTTP Methods (Backward-compatible with src/utils/api.js)
  get: (endpoint, role) => request(endpoint, { method: 'GET', ...(role ? { role } : {}) }),
  post: (endpoint, body, role) =>
    request(endpoint, { method: 'POST', body, ...(role ? { role } : {}) }),
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

