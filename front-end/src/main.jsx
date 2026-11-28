import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './store/hooks';
import { registerStoreListeners } from './store/listeners';
import { attachStore } from './services/api';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { syncAuth } from './store/actions/authActions';
import App from './App.jsx';
import { ToastContainer } from './components/common/Toast.jsx';
import './index.css';
import './styles/academy.css';
import './styles/workspace.css';

attachStore(() => store.getState(), store.dispatch);

function StoreListeners() {
  React.useEffect(() => registerStoreListeners(store), []);
  return null;
}

function AuthLocationSync() {
  const { key } = useLocation();
  React.useLayoutEffect(() => {
    store.dispatch(syncAuth());
  }, [key]);
  return null;
}

function PendingUpdates() {
  const count = useAppSelector(
    (state) =>
      Object.values(state.optimisticUpdates.pending).filter(
        (operation) => operation.type !== 'enrollments/recordActivity'
      ).length
  );
  if (!count) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-4 left-4 z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm"
    >
      {count === 1 ? 'Saving change…' : `Saving ${count} changes…`}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <StoreListeners />
      <BrowserRouter>
        <AuthLocationSync />
        <ToastContainer />
        <PendingUpdates />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

import './styles/learner.css';

import './styles/dashboard-polish.css';

import './styles/typography.css';
