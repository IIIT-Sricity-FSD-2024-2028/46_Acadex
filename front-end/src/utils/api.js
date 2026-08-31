const API_BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const { role = 'admin', headers = {}, ...customConfig } = options;
  const config = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      'x-role': role,
      ...headers,
    },
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, config);

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

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get: (endpoint, role = 'admin') => request(endpoint, { method: 'GET', role }),
  post: (endpoint, body, role = 'admin') =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body), role }),
  patch: (endpoint, body, role = 'admin') =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(body), role }),
  delete: (endpoint, role = 'admin') =>
    request(endpoint, { method: 'DELETE', role }),
};

export default api;
