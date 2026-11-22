import {
  remoteRefreshEvents,
  subscribeToStoreEvents,
} from '../store/listeners';
import React, { createContext, useEffect, useMemo, useId, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  refreshInstructor,
  respondInvitation,
  leaveOrganization,
  resetInstructor,
  selectInstructor,
} from '../store/slices/instructorSlice';

export const InstructorScope = createContext(null);

export function InstructorProvider({ children }) {
  const dispatch = useAppDispatch();
  const id = useId();
  const mounted = useRef(true);
  const scope = useMemo(() => ({ id, mounted }), [id]);
  useEffect(() => {
    mounted.current = true;
    const refresh = () => dispatch(refreshInstructor(scope));
    refresh();
    const unsubscribe = subscribeToStoreEvents(remoteRefreshEvents, refresh);
    return () => {
      unsubscribe();
      mounted.current = false;
      dispatch(resetInstructor(id));
    };
  }, [dispatch, scope, id]);
  return (
    <InstructorScope.Provider value={scope}>
      {children}
    </InstructorScope.Provider>
  );
}
export function useInstructorState(scope) {
  const state = useAppSelector((state) => selectInstructor(state, scope?.id));
  const dispatch = useAppDispatch();
  const actions = useMemo(
    () => ({
      refreshInstructor: async () => {
        await dispatch(refreshInstructor(scope)).unwrap();
      },
      acceptOrgInvitation: (id, notes) =>
        dispatch(respondInvitation(scope, id, 'Accepted', notes)),
      declineOrgInvitation: (id, notes) =>
        dispatch(respondInvitation(scope, id, 'Declined', notes)),
      acceptInvitation: (id, notes) =>
        dispatch(respondInvitation(scope, id, 'Accepted', notes)),
      declineInvitation: (id, notes) =>
        dispatch(respondInvitation(scope, id, 'Declined', notes)),
      acceptCourseRequest: (id, notes) =>
        dispatch(respondInvitation(scope, id, 'Accepted', notes)),
      declineCourseRequest: (id, notes) =>
        dispatch(respondInvitation(scope, id, 'Declined', notes)),
      leaveOrganization: () =>
        dispatch(leaveOrganization(scope, state.instructor)),
    }),
    [dispatch, scope, state.instructor]
  );
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
