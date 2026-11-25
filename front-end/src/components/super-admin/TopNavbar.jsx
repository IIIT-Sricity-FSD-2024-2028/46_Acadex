import React, { useEffect } from 'react';
import { Menu, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchWorkspaceSession } from '../../store/actions/usersActions';
import NotificationBell from '../workspace/NotificationBell';

export const SuperAdminTopNavbar = ({ toggleSidebar }) => {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const session = useAppSelector((state) => state.users.workspaceSession);

  useEffect(() => {
    dispatch(fetchWorkspaceSession());
  }, [dispatch, pathname]);

  return (
    <header className="workspace-topbar">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </button>
        <span>Super Admin</span>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <Link to="/super-admin/settings?tab=settings" aria-label="Settings">
          <Settings size={18} />
        </Link>
        <Link
          to="/super-admin/settings?tab=profile"
          className="workspace-profile-link workspace-profile-link--compact"
          aria-label="Open my account"
        >
          <span className="workspace-avatar">
            {session.data?.name?.charAt(0) || '·'}
          </span>
          <strong className="hidden sm:block">My account</strong>
        </Link>
      </div>
    </header>
  );
};
export default SuperAdminTopNavbar;
