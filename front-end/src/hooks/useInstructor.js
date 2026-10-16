import { useContext } from 'react';
import { InstructorContext } from '../context/instructorContextValue';

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
  const context = useContext(InstructorContext);
  return context || defaultInstructorContext;
}
