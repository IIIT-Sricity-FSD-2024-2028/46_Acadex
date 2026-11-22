import { useAppSelector } from '../../store/hooks';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * SuperAdminGuard
 * Wraps the SuperAdminLayout Outlet — redirects to the super-admin
 * login page when there is no valid SuperAdmin session in localStorage.
 */
export function SuperAdminGuard({ children }) {
  const location = useLocation();
  const auth = useAppSelector((state) => state.auth);

  const token =
    auth['nexuspay_auth_token'] ||
    auth['auth_token'];
  const role =
    auth['nexuspay_active_role'] ||
    auth['user_role'];
  const normalizedRole = String(role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

  const isAuthenticated = !!token && normalizedRole === 'superadmin';

  if (!isAuthenticated) {
    // Redirect to the super-admin login, preserving where they wanted to go
    return (
      <Navigate to="/super-admin/login" state={{ from: location }} replace />
    );
  }

  return children;
}

export default SuperAdminGuard;
