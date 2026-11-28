import { syncAuth } from './actions/authActions';

const authSyncEvents = ['focus', 'storage'];

export function registerStoreListeners(store) {
  const handle = () => {
    store.dispatch(syncAuth());
  };
  authSyncEvents.forEach((event) => window.addEventListener(event, handle));
  return () =>
    authSyncEvents.forEach((event) =>
      window.removeEventListener(event, handle)
    );
}
