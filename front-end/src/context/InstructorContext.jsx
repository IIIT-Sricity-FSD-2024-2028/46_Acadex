import React, { useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../services/api';
import { InstructorContext } from './instructorContextValue';

const itemsOf = (res) => (Array.isArray(res) ? res : res?.items || []);

export function InstructorProvider({ children }) {
  const [instructor, setInstructor] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInstructorData = useCallback(async () => {
    setError(null);
    try {
      const userId = localStorage.getItem('user_id');
      const userEmail = (localStorage.getItem('user_email') || '').toLowerCase().trim();
      const storedInstructorId = localStorage.getItem('nexuspay_instructor_id');

      const list = itemsOf(await api.instructors.list({ limit: 1000 }));
      const me =
        list.find(
          (i) =>
            (userId && (i.userId === userId || i.id === userId)) ||
            (userEmail && i.email?.toLowerCase() === userEmail) ||
            (storedInstructorId && i.id === storedInstructorId)
        ) || list[0];

      if (!me) throw new Error('No instructor profile is linked to this account');
      setInstructor(me);
      localStorage.setItem('nexuspay_instructor_id', me.id);

      const [invRes, joinRes, coursesRes] = await Promise.allSettled([
        api.instructorRequests.list({ instructorId: me.id, type: 'invitation', limit: 1000 }),
        api.instructorRequests.myJoinRequests(),
        api.instructors.getCourses(me.id),
      ]);
      setInvitations(invRes.status === 'fulfilled' ? itemsOf(invRes.value) : []);
      setJoinRequests(joinRes.status === 'fulfilled' ? itemsOf(joinRes.value) : []);
      setAssignedCourses(me.organizationId && coursesRes.status === 'fulfilled' ? itemsOf(coursesRes.value) : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructorData();
  }, [fetchInstructorData]);

  const run = async (fn) => {
    setActionLoading(true);
    try {
      const result = await fn();
      await fetchInstructorData();
      return result;
    } finally {
      setActionLoading(false);
    }
  };

  const isAffiliated = Boolean(instructor?.organizationId) && instructor?.status === 'Active';
  const pendingJoinRequest = joinRequests.find((r) => /pending/i.test(r.status)) || null;

  const value = {
    instructor,
    isAffiliated,
    invitations,
    joinRequests,
    pendingJoinRequest,
    assignedCourses,
    loading,
    actionLoading,
    error,
    refreshInstructor: fetchInstructorData,
    acceptInvitation: (id, notes) => run(() => api.instructorRequests.respond(id, 'Accepted', notes)),
    declineInvitation: (id, notes) => run(() => api.instructorRequests.respond(id, 'Declined', notes)),
    requestToJoin: (organizationId, message) => run(() => api.instructorRequests.requestToJoin(organizationId, message)),
    cancelJoinRequest: (id) => run(() => api.instructorRequests.cancelJoinRequest(id)),
    leaveOrganization: () => run(() => api.instructors.leaveOrganization(instructor.id)),
  };

  return <InstructorContext.Provider value={value}>{children}</InstructorContext.Provider>;
}

const defaultInstructorContext = {
  instructor: null,
  isAffiliated: false,
  invitations: [],
  joinRequests: [],
  pendingJoinRequest: null,
  assignedCourses: [],
  loading: false,
  actionLoading: false,
  error: null,
  refreshInstructor: async () => {},
  acceptInvitation: async () => {},
  declineInvitation: async () => {},
  requestToJoin: async () => {},
  cancelJoinRequest: async () => {},
  leaveOrganization: async () => {},
};

export function useInstructor() {
  return useContext(InstructorContext) || defaultInstructorContext;
}
