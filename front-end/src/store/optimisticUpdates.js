import { createNextState } from '@reduxjs/toolkit';

// Confirmed state is kept separate from the temporary view. Incoming reads
// and unrelated writes still update the confirmed state while a write is pending.
const fields = (value, keys) =>
  Object.fromEntries(
    keys
      .filter(
        (k) =>
          value?.[k] !== undefined &&
          ['string', 'number', 'boolean'].includes(typeof value[k])
      )
      .map((k) => [k, value[k]])
  );
const profileFields = [
  'name',
  'email',
  'phone',
  'bio',
  'headline',
  'location',
  'description',
  'specialization',
  'address',
  'website',
  'university',
];
const courseFields = [
  'title',
  'description',
  'category',
  'level',
  'price',
  'currency',
  'thumbnail',
  'status',
];
const patch = (row, id, changes) => {
  if (row && row.id === id) Object.assign(row, changes);
};
const patchList = (rows, id, changes) => {
  if (Array.isArray(rows)) rows.forEach((row) => patch(row, id, changes));
};
const remove = (rows, id) =>
  Array.isArray(rows) ? rows.filter((row) => row.id !== id) : rows;
const patchData = (slot, changes) => {
  if (slot?.data) Object.assign(slot.data, changes);
};
const coursePatch = (s, id, changes) => {
  for (const slot of [
    s.selectedOrgCourse,
    s.selectedAdminCourse,
    s.selectedCatalogCourse,
  ])
    patch(slot.data, id, changes);
  for (const slot of [s.orgCourses, s.adminCourses, s.browse])
    patchList(slot.data?.items, id, changes);
  patchList(s.catalog.data, id, changes);
  patchList(s.adminQueue.data?.pending, id, changes);
};
const accountPatch = (s, id, changes) => {
  patch(s.selectedAccount.data, id, changes);
  patchList(s.directory.data?.items, id, changes);
};
const requestPatch = (s, id, changes) => {
  for (const slot of [
    s.invitations,
    s.joinRequests,
    s.incomingJoinRequests,
    s.allRequests,
  ])
    patchList(slot.data, id, changes);
  patchList(s.teachingAssignments.data?.invitations, id, changes);
};
const reviewPatch = (s, id, changes) => {
  for (const slot of [s.myReviews, s.courseReviews, s.instructorReviews])
    patchList(slot.data, id, changes);
};
const disputePatch = (s, id, changes) => {
  patch(s.selected.data, id, changes);
  patchList(s.adminDisputes.data, id, changes);
  patchList(s.studentDisputes.data, id, changes);
  patchList(s.orgSupport.data?.items, id, changes);
};
const byId = (a) => ({ id: a });
const rules = {
  'users/updateAdminProfile': [
    (a) => fields(a, profileFields),
    (s, a) => {
      if (s.adminSession.data?.profile)
        Object.assign(s.adminSession.data.profile, a);
      patchData(s.workspaceSession, a);
    },
  ],
  'users/updateWorkspaceAccount': [
    (a) => fields(a, profileFields),
    (s, a) => {
      patchData(s.workspaceAccount, a);
      patchData(s.workspaceSession, fields(a, ['name']));
    },
  ],
  'users/toggleAccountAccess': [
    (a) => fields(a, ['userId', 'status']),
    (s, a) => accountPatch(s, a.userId, { status: a.status }),
  ],
  'users/verifyOrganizationAccount': [
    (a) => fields(a, ['userId', 'decision']),
    (s, a) =>
      accountPatch(s, a.userId, {
        status: a.decision === 'approve' ? 'Active' : 'Rejected',
      }),
  ],
  'users/deleteAccount': [
    byId,
    (s, a) => {
      if (s.directory.data?.items)
        s.directory.data.items = remove(s.directory.data.items, a.id);
    },
  ],
  'learners/updateStudentProfile': [
    (a) => fields(a, profileFields),
    (s, a) => patchData(s.studentProfile, a),
  ],
  'learners/update': [
    (a) => ({
      id: a.id,
      changes: fields(a.data, [...profileFields, 'status']),
    }),
    (s, a) => {
      patchList(s.items.data, a.id, a.changes);
      patchList(s.orgLearners.data, a.id, a.changes);
      patch(s.orgLearnerDetail.data, a.id, a.changes);
    },
  ],
  'learners/delete': [
    byId,
    (s, a) => {
      s.items.data = remove(s.items.data, a.id);
      s.orgLearners.data = remove(s.orgLearners.data, a.id);
    },
  ],
  'organizations/updateProfile': [
    (a) => fields(a, profileFields),
    (s, a) => patchData(s.profile, a),
  ],
  'organizations/verifyInstitution': [
    (a) => ({
      id: a.id,
      changes: fields(a.data, ['status', 'verificationStatus', 'isVerified']),
    }),
    (s, a) => patchList(s.institutions.data, a.id, a.changes),
  ],
  'instructors/updateStatus': [
    (a) => fields(a, ['id', 'status']),
    (s, a) => {
      patch(s.selected.data, a.id, { status: a.status });
      patchList(s.items.data, a.id, { status: a.status });
    },
  ],
  'courses/updateCourse': [
    (a) => ({ id: a.id, changes: fields(a.data, courseFields) }),
    (s, a) => coursePatch(s, a.id, a.changes),
  ],
  'courses/updateAdminCourse': [
    (a) => ({ id: a.courseId, changes: fields(a.form, courseFields) }),
    (s, a) => coursePatch(s, a.id, a.changes),
  ],
  'courses/submitForApproval': [
    byId,
    (s, a) => coursePatch(s, a.id, { status: 'Pending Approval' }),
  ],
  'courses/reviewAdminCourse': [
    (a) => fields(a, ['courseId', 'decision']),
    (s, a) => {
      patch(s.selectedAdminCourse.data, a.courseId, {
        status: a.decision === 'approve' ? 'Published' : 'Rejected',
      });
      if (s.adminCourses.data?.items)
        s.adminCourses.data.items = remove(
          s.adminCourses.data.items,
          a.courseId
        );
      if (s.adminQueue.data?.pending)
        s.adminQueue.data.pending = remove(
          s.adminQueue.data.pending,
          a.courseId
        );
    },
  ],
  'courses/archiveAdminCourse': [
    byId,
    (s, a) => coursePatch(s, a.id, { status: 'Archived' }),
  ],
  'courses/deleteAdminCourse': [
    byId,
    (s, a) => {
      if (s.adminCourses.data?.items)
        s.adminCourses.data.items = remove(s.adminCourses.data.items, a.id);
    },
  ],
  'reviews/update': [
    (a) => fields(a, ['reviewId', 'rating', 'comment']),
    (s, a) => reviewPatch(s, a.reviewId, fields(a, ['rating', 'comment'])),
  ],
  'reviews/delete': [
    (a) => fields(a, ['reviewId']),
    (s, a) => {
      for (const slot of [s.myReviews, s.courseReviews])
        slot.data = remove(slot.data, a.reviewId);
    },
  ],
  'reviews/reply': [
    (a) => fields(a, ['id', 'response']),
    (s, a) => reviewPatch(s, a.id, { response: a.response }),
  ],
  'reviews/deleteReply': [
    byId,
    (s, a) => reviewPatch(s, a.id, { response: null, repliedAt: null }),
  ],
  'disputes/transition': [
    (a) => fields(a, ['disputeId', 'status']),
    (s, a) => disputePatch(s, a.disputeId, { status: a.status }),
  ],
  'instructorRequests/respondInvitation': [
    (a) => fields(a, ['id', 'decision']),
    (s, a) =>
      requestPatch(s, a.id, {
        status: /^accept/i.test(a.decision)
          ? 'Accepted by Professor'
          : 'Declined by Professor',
      }),
  ],
  'instructorRequests/withdrawInvitation': [
    (a) => fields(a, ['requestId']),
    (s, a) =>
      requestPatch(s, a.requestId, { status: 'Withdrawn by Organization' }),
  ],
  'instructorRequests/decideJoinRequest': [
    (a) => fields(a, ['requestId', 'action']),
    (s, a) =>
      requestPatch(s, a.requestId, {
        status: /^approve/i.test(a.action)
          ? 'Approved by Organization'
          : 'Rejected by Organization',
      }),
  ],
  'curriculum/decideModuleRequest': [
    (a) => fields(a, ['requestId', 'decision', 'note']),
    (s, a) => {
      const changes = {
        status: a.decision === 'approve' ? 'Approved' : 'Rejected',
        note: a.note,
      };
      patchList(s.moduleRequests.data, a.requestId, changes);
      patch(s.loggedRequest.data, a.requestId, changes);
    },
  ],
  'notifications/dismissWorkspace': [
    byId,
    (s, a) => {
      if (s.workspace.data?.items) {
        s.workspace.data.items = remove(s.workspace.data.items, a.id);
        s.workspace.data.unreadCount = s.workspace.data.items.filter(
          (item) => !item.read
        ).length;
      }
    },
  ],
  'settings/update': [
    (a) => fields(a, Object.keys(a || {})),
    (s, a) => {
      if (s.data) Object.assign(s.data, a);
    },
  ],
};

// Operations that require generated IDs, server-calculated values or security
// confirmation are represented as pending intents, never fabricated results.
const pendingOnly = new Set([
  'courses/createCourse',
  'courses/assignInstructors',
  'learners/create',
  'organizations/syncCounts',
  'instructors/leaveOrganization',
  'instructorRequests/sendInvitation',
  'instructorRequests/resendInvitation',
  'instructorRequests/decideJoinRequest',
  'disputes/createStudent',
  'disputes/createOrgSupport',
  'disputes/addAdminComment',
  'disputes/addStudentComment',
  'reviews/create',
  'enrollments/enrollFree',
  'enrollments/assignToLearners',
  'enrollments/recordActivity',
  'curriculum/uploadMedia',
  'curriculum/saveDraft',
  'curriculum/submitModuleRequest',
  'curriculum/createModuleAndSaveDraft',
  'curriculum/createLessonAndSaveDraft',
  'curriculum/linkQuizToItem',
  'curriculum/decideModuleRequest',
  'quizzes/save',
  'quizzes/submitStudentAssessment',
  'payments/checkoutCourse',
  'payments/recordAdminPayout',
  'settings/resetDatabase',
  'auth/login',
  'auth/register',
  'auth/changePassword',
  'auth/requestPasswordReset',
  'auth/resetPassword',
  'enrollments/updateProgress',
  'notifications/markWorkspaceRead',
  'notifications/markAllWorkspaceRead',
  'notifications/markInstructorRead',
  'notifications/markAllInstructorRead',
  'notifications/dismissWorkspace',
]);

export function reduceOptimistic(state, action, reducer, sessionChanged) {
  const {
    optimisticUpdates: previous = { pending: {}, confirmed: {} },
    ...visible
  } = state || {};
  const base = state ? { ...visible, ...previous.confirmed } : undefined;
  const confirmed = reducer(base, action);
  const pending = { ...previous.pending };
  const [, type, phase] =
    /^(.*)\/(pending|fulfilled|rejected)$/.exec(action.type) || [];
  const id = action.meta?.requestId;
  if (sessionChanged(base, confirmed, action)) {
    return { ...confirmed, optimisticUpdates: { pending: {}, confirmed: {} } };
  }
  if (id && phase === 'pending' && (rules[type] || pendingOnly.has(type))) {
    pending[id] = {
      type,
      ...(rules[type] ? { args: rules[type][0](action.meta.arg) } : {}),
    };
  } else if (id && (phase === 'fulfilled' || phase === 'rejected')) {
    delete pending[id];
  }
  const snapshots = {};
  const result = { ...confirmed };
  for (const operation of Object.values(pending)) {
    const rule = rules[operation.type];
    if (!rule) continue;
    const domain = operation.type.split('/')[0];
    snapshots[domain] = confirmed[domain];
    result[domain] = createNextState(result[domain], (draft) =>
      rule[1](draft, operation.args)
    );
  }
  return { ...result, optimisticUpdates: { pending, confirmed: snapshots } };
}
