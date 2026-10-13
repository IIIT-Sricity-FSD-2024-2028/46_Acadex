import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const InstructorContext = createContext(null);

export function InstructorProvider({ children }) {
  const [instructor, setInstructor] = useState(null);
  const [isAffiliated, setIsAffiliated] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInstructorData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem('user_id');
      const userEmail = (localStorage.getItem('user_email') || '').toLowerCase().trim();
      const userName = localStorage.getItem('user_name') || 'Faculty Instructor';

      // 1. Fetch current user from auth session
      let authUser = null;
      if (userId) {
        try {
          authUser = await api.auth.getMe(userId);
        } catch {
          // Fallback if auth/me failed
        }
      }

      // 2. Fetch instructor list from API
      let matchedInstructor = null;
      try {
        const instListRes = await api.instructors.list({ limit: 1000 });
        const list = Array.isArray(instListRes)
          ? instListRes
          : instListRes?.items || instListRes?.data || [];

        matchedInstructor = list.find(
          (i) =>
            (userEmail && i.email?.toLowerCase() === userEmail) ||
            (userId && i.userId === userId) ||
            (authUser?.instructorId && i.id === authUser.instructorId)
        );
      } catch {
        // Fallback
      }

      // Combine profile information
      const finalOrgId = matchedInstructor?.organizationId || authUser?.organizationId || null;

      const finalOrgName =
        matchedInstructor?.organizationName ||
        authUser?.organizationName ||
        null;

      const resolvedInstructor = {
        id: matchedInstructor?.id || authUser?.instructorId || `inst-${userId || 'guest'}`,
        name: matchedInstructor?.name || authUser?.name || userName,
        email: matchedInstructor?.email || authUser?.email || userEmail,
        avatar:
          matchedInstructor?.avatar ||
          authUser?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        specialization: matchedInstructor?.specialization || 'Computer Science & AI',
        status: matchedInstructor?.status || authUser?.status || (finalOrgId ? 'Active' : 'Pending Affiliation'),
        organizationId: finalOrgId,
        organizationName: finalOrgName,
      };

      setInstructor(resolvedInstructor);
      setIsAffiliated(Boolean(resolvedInstructor.organizationId));

      // 3. Fetch invitations / teaching requests for this instructor
      try {
        const reqRes = await api.instructorRequests.list({ limit: 1000 });
        const allReqs = Array.isArray(reqRes) ? reqRes : reqRes?.items || reqRes?.data || [];
        const myRequests = allReqs.filter(
          (r) =>
            (resolvedInstructor.id && r.instructorId === resolvedInstructor.id) ||
            (resolvedInstructor.email && r.email?.toLowerCase() === resolvedInstructor.email.toLowerCase()) ||
            (userEmail && r.email?.toLowerCase() === userEmail)
        );
        setInvitations(myRequests);
      } catch (reqErr) {
        console.error('Error fetching instructor requests:', reqErr);
        setInvitations([]);
      }

      // 4. Fetch assigned courses
      try {
        const coursesRes = await api.courses.list({ limit: 1000 });
        const allCourses = Array.isArray(coursesRes) ? coursesRes : coursesRes?.items || coursesRes?.data || [];
        
        // Instructor only sees courses if affiliated and assigned
        if (resolvedInstructor.organizationId) {
          const myCourses = allCourses.filter((course) => {
            const hasId = course.instructorId === resolvedInstructor.id;
            const inInstructors = (course.instructors || []).some(
              (inst) =>
                inst.id === resolvedInstructor.id ||
                (resolvedInstructor.email && inst.email?.toLowerCase() === resolvedInstructor.email.toLowerCase()) ||
                (resolvedInstructor.name && inst.name?.toLowerCase() === resolvedInstructor.name.toLowerCase())
            );
            return hasId || inInstructors;
          });
          setAssignedCourses(myCourses);
        } else {
          setAssignedCourses([]);
        }
      } catch (cErr) {
        console.error('Error fetching assigned courses:', cErr);
        setAssignedCourses([]);
      }
    } catch (err) {
      console.error('Error loading instructor context:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructorData();
  }, [fetchInstructorData]);

  // Accept formal course assignment & connect university
  const acceptInvitation = async (requestId, notes = 'Accepted teaching assignment') => {
    try {
      setActionLoading(true);
      await api.instructorRequests.respond(requestId, 'Accepted', notes);
      await fetchInstructorData();
      return true;
    } catch (err) {
      console.error('Failed to accept invitation:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Decline invitation
  const declineInvitation = async (requestId, notes = 'Declined due to schedule constraints') => {
    try {
      setActionLoading(true);
      await api.instructorRequests.respond(requestId, 'Declined', notes);
      await fetchInstructorData();
      return true;
    } catch (err) {
      console.error('Failed to decline invitation:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const value = {
    instructor,
    isAffiliated,
    invitations,
    assignedCourses,
    loading,
    actionLoading,
    error,
    acceptInvitation,
    declineInvitation,
    refreshInstructor: fetchInstructorData,
  };

  return <InstructorContext.Provider value={value}>{children}</InstructorContext.Provider>;
}

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
