import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { registerStoreListeners } from './store/listeners';
import { attachStore } from './services/api';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { syncAuth } from './store/actions/authActions';
import App from './App.jsx';
import { ToastContainer } from './components/common/Toast.jsx';
import './index.css';
import './styles/academy.css';
import './styles/workspace.css';

attachStore(() => store.getState());

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <StoreListeners />
      <BrowserRouter>
        <AuthLocationSync />
        <ToastContainer />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

import './styles/learner.css';

import './styles/dashboard-polish.css';

import './styles/typography.css';
