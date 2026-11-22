import {
  remoteRefreshEvents,
  subscribeToStoreEvents,
} from '../store/listeners';
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAdminSession,
  initialAdminSession,
  replaceAdminSession,
} from '../store/slices/adminSessionSlice';
const Context = createContext(null);
export function AdminSessionProvider({ children }) {
  const dispatch = useAppDispatch();
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((n) => n + 1), []);
  useEffect(() => {
    const unsubscribe = subscribeToStoreEvents(remoteRefreshEvents, refresh);
    return () => {
      unsubscribe();
      dispatch(replaceAdminSession(initialAdminSession));
    };
  }, [dispatch, refresh]);
  useEffect(() => {
    let active = true;
    dispatch(fetchAdminSession(() => active));
    return () => {
      active = false;
    };
  }, [dispatch, revision]);
  const { pathname } = useLocation();
  useEffect(() => {
    refresh();
  }, [pathname, refresh]);
  useEffect(
    () => subscribeToStoreEvents(['admin-data-changed'], refresh),
    [refresh]
  );
  return <Context.Provider value={refresh}>{children}</Context.Provider>;
}
export function useAdminSession() {
  const refresh = useContext(Context);
  const state = useAppSelector((root) => root.adminSession);
  return refresh
    ? {
        ...state,
        refresh,
        profile: state.data?.profile,
        unreadNotifications: state.data?.unreadNotifications || 0,
      }
    : null;
}
