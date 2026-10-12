import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * StudentContext
 * Central Context API state manager for the Student / Learner Portal.
 * Eliminates prop-drilling and redundant API state synchronization across
 * Dashboard, Explore Catalog, Course Details, Checkout, Quiz, and Profile.
 */
const StudentContext = createContext(null);

const DEFAULT_STUDENT_PROFILE = {
  id: 'usr-student-260',
  name: 'Vujja Punith Sai',
  rollNumber: 'S20240010260',
  email: 's20240010260@iiits.in',
  institution: 'IIIT Sri City',
  title: 'Enterprise FinTech & Full-Stack Architect',
  location: 'Sri City, Andhra Pradesh, India',
  bio: 'Specializing in secure transaction processing, distributed ledger architecture, and reactive cloud engineering.',
  streakDays: 14,
  weeklyGoalHours: 15,
  completedHoursThisWeek: 9.5,
  skills: ['React 18', 'Distributed Consensus', 'NestJS', 'API Gateway Security', 'AWS Cloud Architecture'],
  interests: ['Cloud Architecture', 'DevOps', 'Machine Learning', 'FinTech Engineering', 'Cybersecurity']
};

export function StudentProvider({ children }) {
  // Initialize student profile from localStorage or defaults
  const [student, setStudent] = useState(() => {
    try {
      const stored = localStorage.getItem('nexuspay_student_profile');
      if (stored) {
        return { ...DEFAULT_STUDENT_PROFILE, ...JSON.parse(stored) };
      }
      const userName = localStorage.getItem('user_name');
      const userEmail = localStorage.getItem('user_email');
      return {
        ...DEFAULT_STUDENT_PROFILE,
        name: userName || DEFAULT_STUDENT_PROFILE.name,
        email: userEmail || DEFAULT_STUDENT_PROFILE.email
      };
    } catch {
      return DEFAULT_STUDENT_PROFILE;
    }
  });

  // Persistent bookmarks set
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('nexuspay_student_bookmarks');
      return saved ? JSON.parse(saved) : ['crs-1', 'advanced-api-integrations'];
    } catch {
      return ['crs-1'];
    }
  });

  // Enrolled courses state
  const [enrolledCourses, setEnrolledCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('nexuspay_enrolled_courses');
      return saved ? JSON.parse(saved) : [
        {
          id: 'crs-1',
          title: 'Advanced Enterprise Architecture & Payment Systems',
          institution: 'Stanford University',
          progress: 80,
          currentModule: 'Module 2: Distributed Consensus & Two-Phase Commit',
          enrolledAt: '2026-09-15'
        },
        {
          id: 'aws-solutions-architect',
          title: 'Advanced AWS Solutions Architect Certification',
          institution: 'CloudTech Academy',
          progress: 45,
          currentModule: 'Module 3: VPC Peering & Transit Gateways',
          enrolledAt: '2026-09-20'
        }
      ];
    } catch {
      return [];
    }
  });

  // Persistent certificates records
  const [completedCertificates, setCompletedCertificates] = useState(() => {
    try {
      const saved = localStorage.getItem('nexuspay_student_certificates');
      return saved ? JSON.parse(saved) : [
        {
          id: 'cert-101',
          courseId: 'crs-1',
          courseTitle: 'Advanced Enterprise Architecture & Payment Systems',
          issuedDate: 'October 10, 2026',
          credentialId: 'NP-STAN-2026-8849',
          grade: 92
        }
      ];
    } catch {
      return [];
    }
  });

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexuspay_student_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Could not persist bookmarks:', e);
    }
  }, [bookmarks]);

  // Sync enrolled courses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexuspay_enrolled_courses', JSON.stringify(enrolledCourses));
    } catch (e) {
      console.warn('Could not persist enrolled courses:', e);
    }
  }, [enrolledCourses]);

  // Sync profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexuspay_student_profile', JSON.stringify(student));
      localStorage.setItem('user_name', student.name);
      localStorage.setItem('user_email', student.email);
    } catch (e) {
      console.warn('Could not persist student profile:', e);
    }
  }, [student]);

  // ── ACTIONS & HANDLERS ────────────────────────────────────────────────

  const isBookmarked = useCallback(
    (courseId) => bookmarks.includes(courseId),
    [bookmarks]
  );

  const toggleBookmark = useCallback((courseId) => {
    if (!courseId) return;
    setBookmarks((prev) => {
      const exists = prev.includes(courseId);
      return exists ? prev.filter((id) => id !== courseId) : [...prev, courseId];
    });
  }, []);

  const enrollInCourse = useCallback((course) => {
    if (!course) return;
    setEnrolledCourses((prev) => {
      const exists = prev.find((c) => c.id === course.id);
      if (exists) return prev;
      const newEnrollment = {
        id: course.id,
        title: course.title,
        institution: course.institution || 'NexusPay Institute',
        thumbnail: course.thumbnail,
        progress: 0,
        currentModule: 'Module 1: Orientation & Architecture Foundations',
        enrolledAt: new Date().toISOString()
      };
      return [newEnrollment, ...prev];
    });
  }, []);

  const updateCourseProgress = useCallback((courseId, newProgress) => {
    setEnrolledCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const clamped = Math.min(100, Math.max(0, newProgress));
          return { ...c, progress: clamped };
        }
        return c;
      })
    );
  }, []);

  const updateProfile = useCallback((updates) => {
    setStudent((prev) => ({
      ...prev,
      ...updates
    }));
  }, []);

  const addCertificate = useCallback((cert) => {
    setCompletedCertificates((prev) => {
      const exists = prev.find((c) => c.courseId === cert.courseId);
      if (exists) return prev;
      return [cert, ...prev];
    });
  }, []);

  // Memoized context value to prevent unneeded re-renders
  const contextValue = useMemo(
    () => ({
      student,
      bookmarks,
      enrolledCourses,
      completedCertificates,
      isBookmarked,
      toggleBookmark,
      enrollInCourse,
      updateCourseProgress,
      updateProfile,
      addCertificate
    }),
    [
      student,
      bookmarks,
      enrolledCourses,
      completedCertificates,
      isBookmarked,
      toggleBookmark,
      enrollInCourse,
      updateCourseProgress,
      updateProfile,
      addCertificate
    ]
  );

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
}

/**
 * useStudent Custom Hook
 * Custom hook providing ergonomic access to StudentContext with guard validation.
 */
export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a <StudentProvider>');
  }
  return context;
}

export default StudentContext;
