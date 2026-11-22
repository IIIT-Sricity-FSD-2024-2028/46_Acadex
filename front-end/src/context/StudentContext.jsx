import { subscribeToStoreEvents } from '../store/listeners';
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useId,
  useRef,
} from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  refreshStudent,
  updateStudentProfile,
  resetStudent,
  selectStudent,
} from '../store/slices/studentSlice';

// The context only records provider scope; all domain state lives in Redux.
const StudentContext = createContext(null);
export function StudentProvider({ children }) {
  const dispatch = useAppDispatch();
  const id = useId();
  const mounted = useRef(true);
  const scope = useMemo(() => ({ id, mounted }), [id]);
  useEffect(() => {
    mounted.current = true;
    const refresh = () => dispatch(refreshStudent(scope));
    refresh();
    const unsubscribe = subscribeToStoreEvents(
      ['focus', 'learning-data-changed'],
      refresh
    );
    return () => {
      unsubscribe();
      mounted.current = false;
      dispatch(resetStudent(id));
    };
  }, [dispatch, scope, id]);
  return (
    <StudentContext.Provider value={scope}>{children}</StudentContext.Provider>
  );
}
export function useStudent() {
  const scope = useContext(StudentContext);
  const state = useAppSelector((state) => selectStudent(state, scope?.id));
  const dispatch = useAppDispatch();
  const refreshData = useCallback(async () => {
    await dispatch(refreshStudent(scope)).unwrap();
  }, [dispatch, scope]);
  const updateProfile = useCallback(
    (updates) => dispatch(updateStudentProfile(scope, updates)),
    [dispatch, scope]
  );
  const value = useMemo(
    () => ({ ...state, refreshData, updateProfile }),
    [state, refreshData, updateProfile]
  );
  if (!scope)
    throw new Error('useStudent must be used within a <StudentProvider>');
  return value;
}
