import {
  remoteRefreshEvents,
  subscribeToStoreEvents,
} from '../store/listeners';
import { useCallback, useEffect, useState, useId } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchRemoteData,
  initialRemoteData,
  removed,
} from '../store/slices/remoteDataSlice';
export function useRemoteData(path) {
  const key = useId();
  const dispatch = useAppDispatch();
  const state = useAppSelector(
    (root) => root.remoteData[key] || initialRemoteData
  );
  useEffect(
    () => () => {
      dispatch(removed(key));
    },
    [dispatch, key]
  );
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((n) => n + 1), []);
  useEffect(
    () => subscribeToStoreEvents(remoteRefreshEvents, refresh),
    [refresh]
  );
  useEffect(() => {
    let active = true;
    dispatch(fetchRemoteData(key, path, () => active));
    return () => {
      active = false;
    };
  }, [dispatch, key, path, revision]);
  return { ...state, refresh };
}
