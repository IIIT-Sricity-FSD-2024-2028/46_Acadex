import { useAppSelector } from '../../../store/hooks';
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
  const auth = useAppSelector((state) => state.auth);

  const rawToken =
    auth['nexuspay_auth_token'] ||
    auth['auth_token'] ||
    auth['nexuspay_student_token'];

  const token =
    rawToken &&
    rawToken !== 'null' &&
    rawToken !== 'undefined' &&
    typeof rawToken === 'string' &&
    rawToken.trim() !== ''
      ? rawToken
      : null;

  // If no auth token is found or token is invalid, redirect to Student sign-in
  if (!token) {
    return (
      <Navigate to="/signin?role=Student" state={{ from: location }} replace />
    );
  }

  return children;
}

export default StudentGuard;
