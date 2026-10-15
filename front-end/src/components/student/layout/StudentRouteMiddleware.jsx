import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { StudentProvider } from '../../../context/StudentContext';

/**
 * StudentRouteMiddleware
 * Centralized Routing Middleware for the Student / Learner Portal.
 * 
 * Middleware Pipeline:
 * 1. Viewport Scroll Restoration Middleware: Automatically scrolls to the top of the viewport on path change.
 * 2. Persistent Context Injection Middleware: Injects StudentProvider once across all nested routes via <Outlet />.
 *
 * Student pages are intentionally available directly so the local demo portal
 * can be opened at /student without a pre-existing browser session.
 */
export function StudentRouteMiddleware() {
  const location = useLocation();

  // Scroll Restoration Middleware: reset viewport on each route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Inject persistent StudentContext across all nested child routes
  return (
    <StudentProvider>
      <Outlet />
    </StudentProvider>
  );
}

export default StudentRouteMiddleware;
