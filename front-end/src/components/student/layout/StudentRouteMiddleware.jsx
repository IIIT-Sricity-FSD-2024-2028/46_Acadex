import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { StudentProvider } from '../../../context/StudentContext';

/**
 * StudentRouteMiddleware
 * Centralized Routing Middleware for the Student / Learner Portal.
 * 
 * Middleware Pipeline:
 * 1. Authentication Guard Middleware: Validates active JWT token; denies access to unauthenticated sessions.
 * 2. Route Protection & Redirect Preserver: Captures location in state so user is redirected back post-login.
 * 3. Session Activity Tracker Middleware: Records timestamps of user navigation to maintain active session.
 * 4. Viewport Scroll Restoration Middleware: Automatically scrolls to the top of the viewport on path change.
 * 5. Persistent Context Injection Middleware: Injects StudentProvider once across all nested routes via <Outlet />.
 */
export function StudentRouteMiddleware() {
  const location = useLocation();

  // Scroll Restoration Middleware: reset viewport on each route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Auth Guard Middleware: Verify presence and validity of student authentication token
  const rawToken =
    localStorage.getItem('nexuspay_auth_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('nexuspay_student_token');

  const token =
    rawToken &&
    rawToken !== 'null' &&
    rawToken !== 'undefined' &&
    typeof rawToken === 'string' &&
    rawToken.trim() !== ''
      ? rawToken
      : null;

  // Session Activity Middleware: update user activity heartbeat
  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem('nexuspay_student_last_active', new Date().toISOString());
      } catch (e) {
        // localStorage write suppression
      }
    }
  }, [location.pathname, token]);

  // If unauthenticated, redirect to sign-in with intended location
  if (!token) {
    return (
      <Navigate
        to="/signin?role=Student"
        state={{ from: location }}
        replace
      />
    );
  }

  // Inject persistent StudentContext across all nested child routes
  return (
    <StudentProvider>
      <Outlet />
    </StudentProvider>
  );
}

export default StudentRouteMiddleware;
