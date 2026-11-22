import { useCallback, useEffect, useId, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { removed, replaced } from '../store/slices/remoteDataSlice';

// A view owns its response and keeps its original request and reset timing.
export function useServerRecord(name, initialValue) {
  const id = useId();
  const key = name + ':' + id;
  const dispatch = useAppDispatch();
  const initial = useRef(initialValue).current;
  const mounted = useRef(false);
  const value = useAppSelector((state) =>
    Object.hasOwn(state.remoteData, key) ? state.remoteData[key] : initial
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      dispatch(removed(key));
    };
  }, [dispatch, key]);
  const setValue = useCallback(
    (update) => {
      if (!mounted.current) return;
      dispatch((dispatch, getState) => {
        const entries = getState().remoteData;
        const previous = Object.hasOwn(entries, key) ? entries[key] : initial;
        const value = typeof update === 'function' ? update(previous) : update;
        dispatch(replaced({ key, value }));
      });
    },
    [dispatch, initial, key]
  );
  return [value, setValue];
}
