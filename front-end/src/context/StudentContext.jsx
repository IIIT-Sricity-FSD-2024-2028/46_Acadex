import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCertificates, setCompletedCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bookmarks are a local UI preference — no backend entity for them
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('nexuspay_student_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const userId = localStorage.getItem('nexuspay_user_id') || localStorage.getItem('user_id');

  const refreshData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const [profileRes, enrollmentsRes, certsRes] = await Promise.allSettled([
        api.student.getProfile(userId),
        api.student.getEnrollments(userId),
        api.student.getCertificates(userId),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setStudent(profileRes.value);
      }
      if (enrollmentsRes.status === 'fulfilled') {
        const items = Array.isArray(enrollmentsRes.value)
          ? enrollmentsRes.value
          : enrollmentsRes.value?.items || [];
        setEnrolledCourses(items);
      }
      if (certsRes.status === 'fulfilled') {
        const items = Array.isArray(certsRes.value)
          ? certsRes.value
          : certsRes.value?.items || [];
        setCompletedCertificates(items);
      }
    } catch (err) {
      console.error('Failed to load student data from backend:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Persist bookmarks as a local preference
  useEffect(() => {
    try {
      localStorage.setItem('nexuspay_student_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Could not persist bookmarks:', e);
    }
  }, [bookmarks]);

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
      const existsIndex = prev.findIndex((c) => c.id === course.id || c.courseId === course.id);
      const newEnrollment = {
        id: course.id,
        courseId: course.id,
        title: course.title,
        courseTitle: course.title,
        institution: course.organizationName || course.institution || '',
        thumbnail: course.thumbnail || course.thumbnailUrl || '',
        thumbnailUrl: course.thumbnail || course.thumbnailUrl || '',
        progress: 0,
        status: 'Active',
        enrolledAt: new Date().toISOString(),
        enrolledDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = { ...copy[existsIndex], ...newEnrollment };
        return copy;
      }
      return [newEnrollment, ...prev];
    });
  }, []);

  const updateCourseProgress = useCallback((courseId, newProgress) => {
    setEnrolledCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId || c.courseId === courseId) {
          return { ...c, progress: Math.min(100, Math.max(0, newProgress)) };
        }
        return c;
      })
    );
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setStudent((prev) => prev ? { ...prev, ...updates } : updates);
    try {
      const updated = await api.student.updateProfile(updates, userId);
      if (updated) setStudent(updated);
    } catch (err) {
      console.error('Failed to update profile on backend:', err);
    }
  }, [userId]);

  const addCertificate = useCallback((cert) => {
    setCompletedCertificates((prev) => {
      const exists = prev.find((c) => c.courseId === cert.courseId);
      if (exists) return prev;
      return [cert, ...prev];
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      student,
      bookmarks,
      enrolledCourses,
      completedCertificates,
      isLoading,
      error,
      isBookmarked,
      toggleBookmark,
      enrollInCourse,
      updateCourseProgress,
      updateProfile,
      addCertificate,
      refreshData,
    }),
    [
      student,
      bookmarks,
      enrolledCourses,
      completedCertificates,
      isLoading,
      error,
      isBookmarked,
      toggleBookmark,
      enrollInCourse,
      updateCourseProgress,
      updateProfile,
      addCertificate,
      refreshData,
    ]
  );

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a <StudentProvider>');
  }
  return context;
}

export default StudentContext;
