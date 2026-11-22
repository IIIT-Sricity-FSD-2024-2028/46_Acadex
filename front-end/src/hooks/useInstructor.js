import {
  InstructorScope,
  useInstructorState,
} from '../context/InstructorContext';
import { useContext } from 'react';

const defaultInstructorContext = {
  instructor: null,
  isAffiliated: false,
  invitations: [],
  pendingCourseRequests: [],
  pendingOrgInvitations: [],
  pendingCount: 0,
  joinRequests: [],
  pendingJoinRequest: null,
  assignedCourses: [],
  loading: false,
  actionLoading: false,
  error: null,
  acceptOrgInvitation: async () => {},
  declineOrgInvitation: async () => {},
  acceptInvitation: async () => {},
  declineInvitation: async () => {},
  acceptCourseRequest: async () => {},
  declineCourseRequest: async () => {},
  leaveOrganization: async () => {},
  refreshInstructor: async () => {},
};

export function useInstructor() {
  const context = useContext(InstructorScope);
  const state = useInstructorState(context);
  return context ? state : defaultInstructorContext;
}
