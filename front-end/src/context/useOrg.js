import { useContext, useMemo } from 'react';
import { OrgScope } from './OrgContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { orgOperation, selectOrgStats } from '../store/slices/orgSlice';
const names = [
  'syncOrgCounts',
  'updateOrgInfo',
  'addCourse',
  'updateCourse',
  'sendCourseTeachingRequest',
  'respondToTeachingRequest',
  'decideJoinRequest',
  'resendInvitation',
  'withdrawInvitation',
  'raiseDispute',
  'updateDisputeStatus',
  'resolveDispute',
  'assignCoursesToLearners',
  'markNotificationRead',
  'markAllNotificationsRead',
  'updateSettings',
  'resetToDefault',
];
export function useOrg() {
  const context = useContext(OrgScope);
  const org = useAppSelector((root) => root.org);
  const stats = useAppSelector(selectOrgStats);
  const dispatch = useAppDispatch();
  const actions = useMemo(
    () =>
      Object.fromEntries(
        names.map((name) => [
          name,
          (...args) =>
            dispatch(
              orgOperation(name, args, { ...context.scope, state: org.data })
            ),
        ])
      ),
    [context, org.data, dispatch]
  );
  if (!context) throw new Error('useOrg must be used within an OrgProvider');
  return {
    ...org.data,
    stats,
    backendStats: org.backendStats,
    isLoading: org.isLoading,
    error: org.error,
    ...actions,
    refreshData: context.refreshData,
  };
}
