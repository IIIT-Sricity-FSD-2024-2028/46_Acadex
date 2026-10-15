import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import OrgContext from './orgContextInstance';



const normalizeTransactionId = (id) => {
  const digits = String(id || '')
    .trim()
    .replace(/\D/g, '');
  const suffix = digits.slice(-6).padStart(6, '0');

  return `TXN-${suffix}`;
};

const normalizeTransaction = (transaction) => {
  const status = String(transaction?.status || '').toLowerCase();
  const normalizedStatus = {
    paid: 'Completed',
    complete: 'Completed',
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    refunded: 'Refunded',
  }[status] || transaction?.status || 'Completed';

  return {
    ...transaction,
    id: normalizeTransactionId(transaction?.id),
    type: transaction?.type || 'Payment',
    payer: transaction?.payer || transaction?.payerName || transaction?.learnerName || 'Unknown payer',
    payerId: transaction?.payerId || transaction?.learnerId,
    course: transaction?.course || transaction?.courseTitle || 'Course unavailable',
    amount: Number(transaction?.amount) || 0,
    method: transaction?.method || transaction?.paymentMethod || transaction?.paymentGateway || 'Not specified',
    date: transaction?.date || transaction?.paymentDate || transaction?.timestamp || transaction?.createdAt || 'Date unavailable',
    status: normalizedStatus,
    createdAt: transaction?.createdAt || transaction?.timestamp,
    updatedAt: transaction?.updatedAt || transaction?.createdAt || transaction?.timestamp,
  };
};

const normalizeTransactions = (transactions) => transactions.map(normalizeTransaction);

export function OrgProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [state, setState] = useState({
    info: {},
    instructors: [],
    instructorRequests: [],
    joinRequests: [],
    learners: [],
    courses: [],
    enrollments: [],
    transactions: [],
    notifications: [],
    settings: {
      autoApproveEnrollments: true,
      emailAlerts: true,
      royaltyAlerts: true,
      weeklyDigest: false,
      requireTwoFactor: true,
      defaultCurrency: 'INR',
      defaultAccessType: 'Paid Masterclass'
    }
  });
  // Helper to extract items from paginated or raw backend responses
  const getItems = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.items)) return res.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  const scopeInvitations = (list, orgId) => list.filter((r) => r.type !== 'join' && (!orgId || r.organizationId === orgId));

  // Fetch all collections from the backend JSON database
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        orgRes,
        instructorsRes,
        requestsRes,
        learnersRes,
        coursesRes,
        enrollmentsRes,
        transactionsRes,
        notificationsRes,
        settingsRes,
        joinRes,
      ] = await Promise.allSettled([
        api?.organization?.get ? api.organization.get() : Promise.resolve(null),
        api?.instructors?.list ? api.instructors.list({ limit: 1000 }) : Promise.resolve([]),
        api?.instructorRequests?.list ? api.instructorRequests.list({ limit: 1000 }) : Promise.resolve([]),
        api?.learners?.list ? api.learners.list({ limit: 1000 }) : Promise.resolve([]),
        api?.courses?.list ? api.courses.list({ limit: 1000 }) : Promise.resolve([]),
        api?.enrollments?.list ? api.enrollments.list({ limit: 1000 }) : Promise.resolve([]),
        api?.payments?.listTransactions ? api.payments.listTransactions({ limit: 1000 }) : Promise.resolve([]),
        api?.notifications?.list ? api.notifications.list({ limit: 1000 }) : Promise.resolve([]),
        api?.settings?.get ? api.settings.get() : Promise.resolve(null),
        api.instructorRequests.incomingJoinRequests(),
      ]);

      const orgInfo = orgRes.status === 'fulfilled' ? orgRes.value : null;

      setState((prev) => ({
        info: orgRes.status === 'fulfilled' && orgRes.value ? orgRes.value : prev.info,
        instructors: instructorsRes.status === 'fulfilled' ? getItems(instructorsRes.value) : prev.instructors,
        instructorRequests: requestsRes.status === 'fulfilled' ? scopeInvitations(getItems(requestsRes.value), orgInfo?.id) : prev.instructorRequests,
        joinRequests: joinRes.status === 'fulfilled' ? getItems(joinRes.value) : prev.joinRequests,
        learners: learnersRes.status === 'fulfilled' ? getItems(learnersRes.value) : prev.learners,
        courses: coursesRes.status === 'fulfilled' ? getItems(coursesRes.value) : prev.courses,
        enrollments: enrollmentsRes.status === 'fulfilled' ? getItems(enrollmentsRes.value) : prev.enrollments,
        transactions: transactionsRes.status === 'fulfilled' ? normalizeTransactions(getItems(transactionsRes.value)) : prev.transactions,
        notifications: notificationsRes.status === 'fulfilled' ? getItems(notificationsRes.value) : prev.notifications,
        settings: settingsRes.status === 'fulfilled' && settingsRes.value ? settingsRes.value : prev.settings,
      }));
    } catch (err) {
      console.error('Failed to load data from backend JSON database:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load from backend on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Dynamic Statistics
  const stats = {
    totalInstructors: state.instructors.length,
    totalLearners: state.learners.length,
    activeCourses: state.courses.length,
    totalEnrollments: state.enrollments.length,
    pendingRequests: state.instructorRequests.filter((r) => /pending|sent/i.test(r.status || '')).length,
    pendingJoinRequests: state.joinRequests.filter((r) => /pending/i.test(r.status || '')).length,
    unreadNotifications: state.notifications.filter((n) => !n.read).length,
    annualRevenue: state.courses.reduce((sum, c) => sum + (c.revenue || 0), 0),
    monthlyRevenue: Math.round(state.courses.reduce((sum, c) => sum + (c.revenue || 0), 0) * 0.3),
  };

  // --- ACTIONS (Updating backend JSON files directly) ---

  // 1. Organization Profile
  const updateOrgInfo = async (newInfo) => {
    try {
      const updated = await api.organization.update(newInfo);
      setState((prev) => ({ ...prev, info: { ...prev.info, ...(updated || newInfo) } }));
      return updated;
    } catch (err) {
      console.error('Failed to update organization profile:', err);
      // Optimistic local update as fallback
      setState((prev) => ({ ...prev, info: { ...prev.info, ...newInfo } }));
      throw err;
    }
  };

  // 2. Course Management
  const addCourse = async (courseData) => {
    try {
      // Resolve assigned instructors
      let assignedInstructors = [];
      if (courseData.instructors && Array.isArray(courseData.instructors) && courseData.instructors.length > 0) {
        assignedInstructors = courseData.instructors;
      } else {
        const lead = state.instructors.find((i) => i.id === courseData.instructorId || i.id === courseData.leadInstructorId) || state.instructors[0];
        assignedInstructors = [
          {
            id: lead.id,
            name: lead.name,
            role: 'Lead Instructor',
            avatar: lead.avatar,
            specialization: lead.specialization,
          },
        ];
        if (Array.isArray(courseData.coInstructorIds)) {
          courseData.coInstructorIds.forEach((cId) => {
            if (cId !== lead.id) {
              const co = state.instructors.find((i) => i.id === cId);
              if (co) {
                assignedInstructors.push({
                  id: co.id,
                  name: co.name,
                  role: 'Co-Instructor',
                  avatar: co.avatar,
                  specialization: co.specialization,
                });
              }
            }
          });
        }
      }

      const leadInstructor = assignedInstructors[0] || state.instructors[0];

      const payload = {
        title: courseData.title,
        category: courseData.category || 'Cloud Architecture',
        level: courseData.level || 'Advanced',
        instructorId: leadInstructor.id,
        coInstructorIds: courseData.coInstructorIds || [],
        instructors: assignedInstructors,
        organizationId: state.info.id || courseData.organizationId,
        organizationName: state.info.name || courseData.organizationName,
        price: parseFloat(courseData.price) || 89.99,
        status: courseData.status || 'Published',
        thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
        description: courseData.description || 'Newly authored curriculum track on enterprise architecture.',
        modules: courseData.modules || [
          { id: 'mod-1', title: 'Module 1: Architecture Foundations', lessons: 4, duration: '3h 15m' },
          { id: 'mod-2', title: 'Module 2: High Throughput Replication', lessons: 5, duration: '4h 00m' },
        ],
      };

      const created = await api.courses.create(payload);

      setState((prev) => ({
        ...prev,
        courses: [created, ...prev.courses.filter((c) => c.id !== created.id)],
      }));

      return created;
    } catch (err) {
      console.error('Failed to create course on backend:', err);
      throw err;
    }
  };

  const updateCourse = async (courseId, updatedData) => {
    try {
      const payload = {
        ...updatedData,
        price: parseFloat(updatedData.price) || updatedData.price,
      };

      const updated = await api.courses.update(courseId, payload);

      setState((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => (c.id === courseId ? { ...c, ...(updated || payload) } : c)),
      }));

      return updated;
    } catch (err) {
      console.error('Failed to update course on backend:', err);
      throw err;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await api.courses.delete(courseId);
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== courseId),
      }));
    } catch (err) {
      console.error('Failed to delete course on backend:', err);
      // Optimistic delete
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== courseId),
      }));
      throw err;
    }
  };

  // 3. College Course Teaching Requests
  const sendCourseTeachingRequest = async ({ instructorId, courseId, courseTitle, semester, creditHours, proposedTerms, message, organizationId, organizationName }) => {
    try {
      const payload = {
        instructorId,
        courseId,
        courseTitle,
        semester,
        creditHours,
        proposedTerms,
        message,
        organizationId: organizationId || state.info?.id,
        organizationName: organizationName || state.info?.name,
      };

      const created = await api.instructorRequests.create(payload);

      // Refresh requests and notifications from backend
      const [requestsRes, notifsRes] = await Promise.all([
        api.instructorRequests.list({ limit: 1000 }),
        api.notifications.list({ limit: 1000 }),
      ]);

      setState((prev) => ({
        ...prev,
        instructorRequests: scopeInvitations(getItems(requestsRes), prev.info?.id),
        notifications: getItems(notifsRes),
      }));

      return created;
    } catch (err) {
      console.error('Failed to send teaching request on backend:', err);
      throw err;
    }
  };

  const respondToTeachingRequest = async (requestId, decision, notes) => {
    try {
      const updated = await api.instructorRequests.respond(requestId, decision, notes);

      // Re-fetch requests, courses, and notifications from backend
      const [requestsRes, coursesRes, notifsRes] = await Promise.all([
        api.instructorRequests.list({ limit: 1000 }),
        api.courses.list({ limit: 1000 }),
        api.notifications.list({ limit: 1000 }),
      ]);

      setState((prev) => ({
        ...prev,
        instructorRequests: scopeInvitations(getItems(requestsRes), prev.info?.id),
        courses: getItems(coursesRes),
        notifications: getItems(notifsRes),
      }));

      return updated;
    } catch (err) {
      console.error('Failed to respond to teaching request on backend:', err);
      throw err;
    }
  };

  const decideJoinRequest = async (requestId, action, notes) => {
    const updated = await api.instructorRequests.decideJoinRequest(requestId, action, notes);
    await refreshData();
    return updated;
  };

  const resendInvitation = async (requestId) => {
    const updated = await api.instructorRequests.resend(requestId);
    setState((prev) => ({
      ...prev,
      instructorRequests: prev.instructorRequests.map((r) => (r.id === requestId ? updated : r)),
    }));
    return updated;
  };

  const withdrawInvitation = async (requestId, reason) => {
    const updated = await api.instructorRequests.withdraw(requestId, reason);
    setState((prev) => ({
      ...prev,
      instructorRequests: prev.instructorRequests.map((r) => (r.id === requestId ? updated : r)),
    }));
    return updated;
  };

  // 4. Enrollments & Course Assignment
  const assignCoursesToLearners = async (courseIds, learnerIds) => {
    try {
      const result = await api.enrollments.assign(courseIds, learnerIds);

      // Re-fetch enrollments, courses, learners, transactions, notifications
      const [enrollmentsRes, coursesRes, learnersRes, transactionsRes, notifsRes] = await Promise.all([
        api.enrollments.list({ limit: 1000 }),
        api.courses.list({ limit: 1000 }),
        api.learners.list({ limit: 1000 }),
        api.payments.listTransactions({ limit: 1000 }),
        api.notifications.list({ limit: 1000 }),
      ]);

      setState((prev) => ({
        ...prev,
        enrollments: getItems(enrollmentsRes),
        courses: getItems(coursesRes),
        learners: getItems(learnersRes),
        transactions: normalizeTransactions(getItems(transactionsRes)),
        notifications: getItems(notifsRes),
      }));

      return result;
    } catch (err) {
      console.error('Failed to assign courses on backend:', err);
      throw err;
    }
  };

  // 5. Notifications
  const markNotificationRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    } catch (err) {
      console.error('Failed to mark notification as read on backend:', err);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read on backend:', err);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      }));
    }
  };


  // 6. Settings & Database Reset
  const updateSettings = async (newSettings) => {
    try {
      const updated = await api.settings.update(newSettings);
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...(updated || newSettings) },
      }));
      return updated;
    } catch (err) {
      console.error('Failed to update settings on backend:', err);
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...newSettings },
      }));
      throw err;
    }
  };

  // Reset database to initial default JSON seed datasets
  const resetToDefault = async () => {
    try {
      await api.settings.resetDatabase();
      await refreshData();
    } catch (err) {
      console.error('Failed to reset backend JSON database:', err);
      await refreshData();
    }
  };

  return (
    <OrgContext.Provider
      value={{
        info: state.info,
        instructors: state.instructors,
        instructorRequests: state.instructorRequests,
        joinRequests: state.joinRequests,
        learners: state.learners,
        courses: state.courses,
        enrollments: state.enrollments,
        transactions: state.transactions,
        notifications: state.notifications,
        settings: state.settings,
        stats,
        isLoading,
        error,
        refreshData,
        // Actions
        updateOrgInfo,
        addCourse,
        updateCourse,
        deleteCourse,
        sendCourseTeachingRequest,
        respondToTeachingRequest,
        decideJoinRequest,
        resendInvitation,
        withdrawInvitation,
        assignCoursesToLearners,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        resetToDefault,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

