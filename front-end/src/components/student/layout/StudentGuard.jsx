import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * StudentGuard
 * Route protection guard for the Student / Learner portal.
 * Redirects unauthenticated users attempting to open direct student URLs in Chrome
 * back to /signin?role=Student, preserving the intended destination in location state.
 */
export function StudentGuard({ children }) {
  const location = useLocation();

  const token =
    localStorage.getItem('nexuspay_auth_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('nexuspay_student_token');

  // If no auth token is found, redirect to Student sign-in
  if (!token) {
    return (
      <Navigate
        to="/signin?role=Student"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}

export default StudentGuard;
