import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Settings } from 'lucide-react';
import NotificationBell from '../workspace/NotificationBell';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchWorkspaceSession } from '../../store/actions/usersActions';

export default function OrgTopNav({ breadcrumbs = [], actions }) {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const session = useAppSelector((state) => state.users.workspaceSession);

  useEffect(() => {
    dispatch(fetchWorkspaceSession());
  }, [dispatch, pathname]);

  return (
    <header className="workspace-topbar">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link to="/org/dashboard">Organization</Link>
        {breadcrumbs.map((c, i) => (
          <React.Fragment key={i}>
            <ChevronRight size={14} />
            {c.path ? (
              <Link to={c.path}>{c.label}</Link>
            ) : (
              <span>{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        {actions}
        <NotificationBell />
        <Link to="/org/profile?tab=settings" aria-label="Settings">
          <Settings size={18} />
        </Link>
        <Link
          className="workspace-profile-link"
          to="/org/profile"
          aria-label="Open organization profile"
        >
          <span className="workspace-avatar">
            {session.data?.name?.charAt(0) || '·'}
          </span>
          <span className="hidden sm:block">
            <strong>{session.data?.name || 'Loading…'}</strong>
            <small>{session.data?.email || ''}</small>
          </span>
        </Link>
      </div>
    </header>
  );
}
