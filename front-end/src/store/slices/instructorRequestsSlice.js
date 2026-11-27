import { createSelector, createSlice } from '@reduxjs/toolkit';
import { clearSession } from '../actions/authActions';
import {
  clearInstructorLookup,
  clearRequestActionError,
  decideJoinRequest,
  fetchAllInstructorRequests,
  fetchIncomingJoinRequests,
  fetchMyInvitations,
  fetchMyJoinRequests,
  fetchTeachingAssignments,
  lookupInstructorByEmail,
  resendInvitation,
  respondInvitation,
  sendInvitation,
  withdrawInvitation,
} from '../actions/instructorRequestsActions';
import { bindResourceLifecycle, createResourceState } from '../utils';

const initialState = {
  invitations: createResourceState([]),
  joinRequests: createResourceState([]),
  incomingJoinRequests: createResourceState([]),
  allRequests: createResourceState([]),
  teachingAssignments: createResourceState(null),
  lookup: createResourceState(null),
  actionLoading: false,
  actionError: '',
};

const instructorRequestsSlice = createSlice({
  name: 'instructorRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    bindResourceLifecycle(builder, fetchMyInvitations, (s) => s.invitations);
    bindResourceLifecycle(builder, fetchMyJoinRequests, (s) => s.joinRequests);
    bindResourceLifecycle(
      builder,
      fetchIncomingJoinRequests,
      (s) => s.incomingJoinRequests
    );
    bindResourceLifecycle(
      builder,
      fetchAllInstructorRequests,
      (s) => s.allRequests
    );
    bindResourceLifecycle(
      builder,
      fetchTeachingAssignments,
      (s) => s.teachingAssignments
    );
    bindResourceLifecycle(builder, lookupInstructorByEmail, (s) => s.lookup, {
      resetOnPending: true,
    });

    const startAction = (state) => {
      state.actionLoading = true;
      state.actionError = '';
    };
    const failAction = (state, action) => {
      state.actionLoading = false;
      state.actionError =
        action.payload || action.error?.message || 'Action failed.';
    };
    const updateItemInList = (list, updated) => {
      if (!Array.isArray(list) || !updated?.id) return list;
      return list.map((item) => (item.id === updated.id ? updated : item));
    };

    builder
      .addCase(clearInstructorLookup, (state) => {
        state.lookup = createResourceState(null);
        state.actionError = '';
      })
      .addCase(clearRequestActionError, (state) => {
        state.actionError = '';
      })

      .addCase(respondInvitation.pending, startAction)
      .addCase(respondInvitation.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.invitations.data = updateItemInList(
          state.invitations.data,
          action.payload
        );
      })
      .addCase(respondInvitation.rejected, failAction)

      .addCase(sendInvitation.pending, startAction)
      .addCase(sendInvitation.fulfilled, (state) => {
        state.actionLoading = false;
        state.lookup.data = null;
      })
      .addCase(sendInvitation.rejected, failAction)

      .addCase(resendInvitation.pending, startAction)
      .addCase(resendInvitation.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.allRequests.data = updateItemInList(
          state.allRequests.data,
          action.payload
        );
        if (state.teachingAssignments.data?.invitations) {
          state.teachingAssignments.data.invitations = updateItemInList(
            state.teachingAssignments.data.invitations,
            action.payload
          );
        }
      })
      .addCase(resendInvitation.rejected, failAction)

      .addCase(withdrawInvitation.pending, startAction)
      .addCase(withdrawInvitation.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.allRequests.data = updateItemInList(
          state.allRequests.data,
          action.payload
        );
        if (state.teachingAssignments.data?.invitations) {
          state.teachingAssignments.data.invitations = updateItemInList(
            state.teachingAssignments.data.invitations,
            action.payload
          );
        }
      })
      .addCase(withdrawInvitation.rejected, failAction)

      .addCase(decideJoinRequest.pending, startAction)
      .addCase(decideJoinRequest.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.incomingJoinRequests.data = updateItemInList(
          state.incomingJoinRequests.data,
          action.payload
        );
      })
      .addCase(decideJoinRequest.rejected, failAction)

      .addCase(clearSession, () => initialState);
  },
});

export const selectPendingOrgInvitations = createSelector(
  [(state) => state.instructorRequests.invitations.data || []],
  (invitations) =>
    invitations.filter(
      (i) =>
        /pending|sent/i.test(i.status || '') &&
        (i.type === 'org-invitation' ||
          !i.courseId ||
          i.courseTitle === 'General Course Assignment')
    )
);

export default instructorRequestsSlice.reducer;
