import { useContext } from 'react';
import { InstructorContext } from '../context/instructorContextValue';

const defaultInstructorContext = {
  instructor: null,
  isAffiliated: false,
  invitations: [],
  assignedCourses: [],
  loading: false,
  actionLoading: false,
  error: null,
  acceptInvitation: async () => {},
  declineInvitation: async () => {},
  refreshInstructor: async () => {},
};

export function useInstructor() {
  const context = useContext(InstructorContext);
  return context || defaultInstructorContext;
}
