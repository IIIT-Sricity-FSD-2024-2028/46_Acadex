import { createAction } from '@reduxjs/toolkit';

export const added = createAction('toast/added');
export const removed = createAction('toast/removed');

/** Dispatch a toast notification and automatically clear it after duration ms. */
export const showToast =
  (message, type = 'success', duration = 3000) =>
  (dispatch) => {
    const id = Date.now() + Math.random();
    dispatch(added({ id, message, type }));
    setTimeout(() => {
      dispatch(removed(id));
    }, duration);
    return id;
  };
