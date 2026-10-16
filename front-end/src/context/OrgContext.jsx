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

// Older seed records predate the current organization IDs.  Keep those records
// visible while the API serves the mixed dataset rather than dropping them from
// every organization-scoped page.
const legacyOrganizationIds = {
  'org-101': 'org-1',
  'org-102': 'org-2',
};

const belongsToOrganization = (recordOrganizationId, organizationId) =>
  !organizationId ||
  recordOrganizationId === organizationId ||
  legacyOrganizationIds[recordOrganizationId] === organizationId;

const courseBelongsToOrganization = (course, organizationId, instructors) => {
  if (!organizationId) return true;
  if (course?.organizationId === organizationId) return true;
  const leadInstructor = instructors.find((instructor) => instructor.id === course?.instructorId);
  return leadInstructor?.organizationId === organizationId;
};

export function OrgProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStats, setBackendStats] = useState(null);

  const [state, setState] = useState({
    info: {},
    instructors: [],
    instructorRequests: [],
    joinRequests: [],
    disputes: [],
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

  const scopeInvitations = (list, orgId) =>
    list.filter((request) => request.type !== 'join' && belongsToOrganization(request.organizationId, orgId));

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
        backendStatsRes,
        joinRequestsRes,
        disputesRes,
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
        api?.organization?.getStats ? api.organization.getStats() : Promise.resolve(null),
        api?.instructorRequests?.incomingJoinRequests ? api.instructorRequests.incomingJoinRequests() : Promise.resolve([]),
        api?.disputes?.list ? api.disputes.list() : Promise.resolve([]),
      ]);

      const orgInfo = orgRes.status === 'fulfilled' && orgRes.value ? orgRes.value : state.info;
      const allInstructors = instructorsRes.status === 'fulfilled' ? getItems(instructorsRes.value) : state.instructors;
      const allCourses = coursesRes.status === 'fulfilled' ? getItems(coursesRes.value) : state.courses;
      const organizationCourses = allCourses.filter((course) =>
        courseBelongsToOrganization(course, orgInfo?.id, allInstructors),
      );
      const organizationCourseIds = new Set(organizationCourses.map((course) => course.id));
      const organizationCourseTitles = new Set(
        organizationCourses.map((course) => String(course.title || '').trim().toLowerCase()),
      );
      const allEnrollments = enrollmentsRes.status === 'fulfilled' ? getItems(enrollmentsRes.value) : state.enrollments;
      const organizationEnrollments = allEnrollments.filter((enrollment) =>
        enrollment.organizationId === orgInfo?.id || organizationCourseIds.has(enrollment.courseId),
      );
      const organizationLearnerIds = new Set(organizationEnrollments.map((enrollment) => enrollment.learnerId));
      const allLearners = learnersRes.status === 'fulfilled' ? getItems(learnersRes.value) : state.learners;
      const organizationLearners = allLearners.filter((learner) =>
        learner.organizationId === orgInfo?.id || organizationLearnerIds.has(learner.id),
      );

      // Store backend stats if available
      if (backendStatsRes.status === 'fulfilled' && backendStatsRes.value) {
        setBackendStats(backendStatsRes.value);
      }

      setState((prev) => ({
        info: orgRes.status === 'fulfilled' && orgRes.value ? orgRes.value : prev.info,
        instructors: allInstructors.filter((instructor) =>
          belongsToOrganization(instructor.organizationId, orgInfo?.id) || organizationCourses.some((course) =>
            course.instructorId === instructor.id || course.instructors?.some((item) => item.id === instructor.id),
          ),
        ),
        instructorRequests: requestsRes.status === 'fulfilled' ? scopeInvitations(getItems(requestsRes.value), orgInfo?.id) : prev.instructorRequests,
        joinRequests: joinRequestsRes.status === 'fulfilled' ? getItems(joinRequestsRes.value) : prev.joinRequests,
        disputes: disputesRes.status === 'fulfilled'
          ? getItems(disputesRes.value).filter((dispute) =>
              belongsToOrganization(dispute.organizationId, orgInfo?.id) ||
              belongsToOrganization(dispute.raisedById, orgInfo?.id) ||
              organizationCourseIds.has(dispute.courseId),
            )
          : prev.disputes,
        learners: organizationLearners,
        courses: organizationCourses,
        enrollments: organizationEnrollments,
        transactions: transactionsRes.status === 'fulfilled'
          ? normalizeTransactions(getItems(transactionsRes.value)).filter((transaction) =>
              belongsToOrganization(transaction.organizationId, orgInfo?.id) ||
              organizationCourseIds.has(transaction.courseId) ||
              organizationCourseTitles.has(String(transaction.course || '').trim().toLowerCase()) ||
              // Some historical payments predate organization and course IDs.
              // Keep an unscoped transaction visible when its payer is enrolled
              // with this organization, without exposing other orgs' payments.
              (!transaction.organizationId && organizationLearnerIds.has(transaction.payerId)),
            )
          : prev.transactions,
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

  // Initial load from backend on mount — refresh all data then sync org counts into organizations.json
  useEffect(() => {
    refreshData().then(() => {
      // After initial data is loaded, sync organizations.json counts so state.info is accurate
      api.organization.syncCounts()
        .then((synced) => {
          if (synced) {
            return api.organization.get();
          }
        })
        .then((freshOrg) => {
          if (freshOrg) setState((prev) => ({ ...prev, info: freshOrg }));
        })
        .catch((err) => console.warn('Initial syncCounts failed (non-critical):', err.message));
    });
  }, [refreshData]);

  // ─── Stats: state.info is the single source of truth for organizations.json fields ───
  // After every mutation, syncOrgCounts() writes back to organizations.json via the backend
  // so that state.info always reflects the persisted counts.
  const stats = {
    // From organizations.json (persisted and kept in sync via syncCounts endpoint)
    totalLearners: state.learners.length,
    activeCourses: state.courses.filter((course) => course.status === 'Published').length,
    annualRevenue: state.courses.reduce(
      (total, course) => total + (Number(course.enrolledCount) || 0) * (Number(course.price) || 0),
      0,
    ),
    monthlyRevenue: Math.round(state.courses.reduce(
      (total, course) => total + (Number(course.enrolledCount) || 0) * (Number(course.price) || 0),
      0,
    ) * 0.3),
    // Live-computed from loaded arrays (always accurate in real time)
    totalInstructors: state.instructors.length,
    totalEnrollments: state.enrollments.length,
    totalCourses:     state.courses.length,
    pendingRequests: state.instructorRequests.filter(
      (r) =>
        r.status === 'Pending Professor Response' ||
        r.status === 'Invite Sent' ||
        r.status === 'Pending' ||
        r.status?.toLowerCase().includes('pending')
    ).length,
    openDisputes: (state.disputes || []).filter((d) => d.status !== 'Resolved').length,
    unreadNotifications: state.notifications.filter((n) => !n.read).length,
    // Extended: from backendStats (computed by the stats endpoint) or sensible defaults
    completionRate:         backendStats?.completionRate         ?? 72,
    averageRating:          backendStats?.averageRating          ?? 4.8,
    activeEnrollments:      backendStats?.activeEnrollments      ?? 0,
    completedEnrollments:   backendStats?.completedEnrollments   ?? 0,
  };

  // --- ACTIONS (Updating backend JSON files directly) ---

  /**
   * syncOrgCounts — calls POST /organization/sync-counts on the backend.
   * The backend recomputes coursesCount, learnersCount, totalRevenue, monthlyRevenue
   * from the actual JSON files and persists them back to organizations.json.
   * Then re-fetches state.info so the UI immediately reflects the new values.
   */
  const syncOrgCounts = useCallback(async () => {
    try {
      const synced = await api.organization.syncCounts();
      if (synced) {
        // Re-fetch the org profile so state.info mirrors organizations.json
        const freshOrg = await api.organization.get();
        if (freshOrg) {
          setState((prev) => ({ ...prev, info: freshOrg }));
        }
      }
    } catch (err) {
      console.warn('syncOrgCounts failed (non-critical):', err.message);
    }
  }, []);

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

      // Sync organizations.json so coursesCount, totalRevenue, monthlyRevenue are updated
      await syncOrgCounts();

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

      // Sync organizations.json so totalRevenue, monthlyRevenue reflect price/revenue changes
      await syncOrgCounts();

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
      // Sync organizations.json so coursesCount, totalRevenue reflect the deletion
      await syncOrgCounts();
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

  // 3b. Organization disputes
  const raiseDispute = async (disputeData) => {
    const created = await api.disputes.raise({
      ...disputeData,
      organizationId: disputeData.organizationId || state.info?.id,
      organizationName: disputeData.organizationName || state.info?.name,
    });
    await refreshData();
    return created;
  };

  const updateDisputeStatus = async (disputeId, status, notes) => {
    const updated = await api.disputes.updateStatus(disputeId, status, notes);
    await refreshData();
    return updated;
  };

  const resolveDispute = async (disputeId, notes) => {
    const updated = await api.disputes.resolve(disputeId, notes);
    await refreshData();
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

      // Sync organizations.json: learnersCount, totalRevenue updated after enrollment
      await syncOrgCounts();

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
      await syncOrgCounts();
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
        disputes: state.disputes,
        learners: state.learners,
        courses: state.courses,
        enrollments: state.enrollments,
        transactions: state.transactions,
        notifications: state.notifications,
        settings: state.settings,
        stats,
        backendStats,
        isLoading,
        error,
        refreshData,
        syncOrgCounts,
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
        raiseDispute,
        updateDisputeStatus,
        resolveDispute,
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

