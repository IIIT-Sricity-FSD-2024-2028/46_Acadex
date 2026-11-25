import { timestampLabel } from '../../utils/adminDisplay';
import { Link, useLocation } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, X, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchWorkspaceNotifications,
  markWorkspaceNotificationRead,
  markAllWorkspaceNotificationsRead,
  dismissWorkspaceNotification,
} from '../../store/actions/notificationsActions';

export function useInbox() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.notifications.workspace);
  const refresh = useCallback(
    () => dispatch(fetchWorkspaceNotifications()),
    [dispatch]
  );

  useEffect(() => {
    refresh();
    const tick = setInterval(refresh, 30000);
    return () => clearInterval(tick);
  }, [refresh]);

  return { ...state, refresh };
}

export function InboxPanel({ compact = false, state: provided }) {
  const dispatch = useAppDispatch();
  const own = useInbox();
  const state = provided || own;
  const [unread, setUnread] = useState(false);

  const busy = state.busyPath || '';
  const items = (state.data?.items || []).filter((n) => !unread || !n.read);

  return (
    <section className={`workspace-inbox ${compact ? 'is-compact' : ''}`}>
      <div className="workspace-inbox-actions">
        <span>{state.data?.unreadCount ?? '—'} unread</span>
        <button
          disabled={!!busy || !state.data?.unreadCount}
          onClick={() => dispatch(markAllWorkspaceNotificationsRead())}
        >
          <CheckCheck size={14} />
          Mark all read
        </button>
        <button onClick={state.refresh} aria-label="Refresh notifications">
          <RefreshCw size={14} />
        </button>
      </div>
      <label className="workspace-unread-filter">
        <input
          type="checkbox"
          checked={unread}
          onChange={(e) => setUnread(e.target.checked)}
        />
        Unread only
      </label>
      {(state.actionError || state.error) && (
        <p role="alert" className="workspace-error">
          {state.actionError || state.error}
          <button onClick={state.refresh}>Retry</button>
        </p>
      )}
      {state.loading && !state.data ? (
        <p className="workspace-inbox-empty">Loading notifications…</p>
      ) : (
        <div className="workspace-inbox-list">
          {items.map((n) => (
            <article key={n.id} className={n.read ? 'is-read' : 'is-unread'}>
              <div className="flex justify-between gap-3">
                <h3>{n.title}</h3>
                <button
                  disabled={!!busy}
                  aria-label={`Dismiss ${n.title}`}
                  onClick={() => dispatch(dismissWorkspaceNotification(n.id))}
                >
                  <X size={14} />
                </button>
              </div>
              <p>{n.desc || n.message || ''}</p>
              {n.actionUrl && (
                <Link className="workspace-notification-link" to={n.actionUrl}>
                  {n.actionLabel || 'View details'} →
                </Link>
              )}
              <div className="workspace-inbox-meta">
                <time>
                  {n.createdAt
                    ? timestampLabel(n.createdAt)
                    : 'Date not recorded'}
                </time>
                {!n.read && (
                  <button
                    disabled={!!busy}
                    onClick={() =>
                      dispatch(markWorkspaceNotificationRead(n.id))
                    }
                  >
                    Mark read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {!state.loading && !state.error && !items.length && (
        <div className="workspace-inbox-empty">
          <Bell size={23} />
          <strong>{unread ? 'All caught up' : 'No notifications yet'}</strong>
        </div>
      )}
    </section>
  );
}

export default function NotificationBell({ href }) {
  const location = useLocation();
  const prefix = location.pathname.startsWith('/organization')
    ? '/org'
    : '/' + location.pathname.split('/')[1];
  const accountPath = ['/admin', '/super-admin'].includes(prefix)
    ? prefix + '/settings'
    : prefix + '/profile';
  const state = useInbox();
  return (
    <Link
      to={href || accountPath + '?tab=notifications'}
      className="workspace-bell"
      aria-label={`Notifications${state.data?.unreadCount ? `, ${state.data.unreadCount} unread` : ''}`}
    >
      <Bell size={19} />
      {!!state.data?.unreadCount && <span>{state.data.unreadCount}</span>}
    </Link>
  );
}
