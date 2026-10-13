import { jsonDataClient } from '../services/jsonDataClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const { role = 'admin', headers = {}, ...customConfig } = options;
  const token = localStorage.getItem('nexuspay_auth_token') || localStorage.getItem('nexuspay_student_token');

  const config = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      'x-role': role,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  try {
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, config);

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // not JSON
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result && typeof result === 'object' && 'data' in result ? result.data : result;
  } catch (error) {
    console.warn(`API request notice [${options.method || 'GET'} ${cleanEndpoint}]:`, error.message);

    // Graceful offline mock fallbacks
    const method = (options.method || 'GET').toUpperCase();
    if (method === 'DELETE') {
      const segments = cleanEndpoint.split('/').filter(Boolean);
      const resource = segments[0];
      const targetId = segments[1];
      if (resource === 'learners' && targetId) {
        return jsonDataClient.deleteLearner(targetId);
      }
      if (resource === 'organizations' && targetId) {
        return jsonDataClient.deleteOrganization(targetId);
      }
      if (resource === 'users' && targetId) {
        return jsonDataClient.deleteAdmin(targetId);
      }
    }

    throw error;
  }
}

export const getItems = (result) => {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.items)) return result.items;
  return [];
};

export const api = {
  get: (endpoint, role = 'admin') => request(endpoint, { method: 'GET', role }),
  post: (endpoint, body, role = 'admin') =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body), role }),
  patch: (endpoint, body, role = 'admin') =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(body), role }),
  delete: (endpoint, role = 'admin') =>
    request(endpoint, { method: 'DELETE', role }),
  getItems,
};

export default api;
