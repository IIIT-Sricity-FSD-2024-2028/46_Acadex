import {
  remoteRefreshEvents,
  subscribeToStoreEvents,
} from '../store/listeners';
import React, { createContext, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { initializeOrg, orgOperation } from '../store/slices/orgSlice';

export const OrgScope = createContext(null);

export function OrgProvider({ children }) {
  const { pathname } = useLocation();
  const inOrgPortal =
    pathname === '/org' ||
    pathname.startsWith('/org/') ||
    pathname.startsWith('/organization/');
  const accountId =
    localStorage.getItem('user_id') || localStorage.getItem('nexuspay_user_id');
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.org.data);
  // Match the original refresh closure, which kept its fallback data until
  // the URL entered or left the organization portal, or the account changed.
  const scope = useMemo(
    () => ({ inOrgPortal, accountId, refreshState: state }),
    [inOrgPortal, accountId]
  );
  const refreshData = useCallback(
    () =>
      dispatch(
        orgOperation('refreshData', [], { ...scope, state: scope.refreshState })
      ),
    [dispatch, scope]
  );
  useEffect(() => {
    if (!inOrgPortal) return;
    return subscribeToStoreEvents(remoteRefreshEvents, refreshData);
  }, [refreshData, inOrgPortal]);

  useEffect(() => {
    if (!inOrgPortal || !accountId) return;
    dispatch(initializeOrg(scope));
  }, [dispatch, scope, inOrgPortal, accountId]);
  const value = useMemo(() => ({ scope, refreshData }), [scope, refreshData]);
  return <OrgScope.Provider value={value}>{children}</OrgScope.Provider>;
}
