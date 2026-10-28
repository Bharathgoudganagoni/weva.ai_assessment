const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal API helper that attaches JWT token and parses JSON responses
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('stockflow_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // If 401 Unauthorized, token may be expired or invalid
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup')) {
      localStorage.removeItem('stockflow_token');
      localStorage.removeItem('stockflow_user');
      localStorage.removeItem('stockflow_org');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'An error occurred while processing your request.');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the backend server. Please verify the API is running.');
    }
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    getMe: () => request('/auth/me', { method: 'GET' }),
  },

  // Products
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return request(`/products${queryString}`, { method: 'GET' });
    },
    getById: (id) => request(`/products/${id}`, { method: 'GET' }),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    adjustStock: (id, { delta, note }) =>
      request(`/products/${id}/adjust-stock`, {
        method: 'PATCH',
        body: JSON.stringify({ delta, note }),
      }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },

  // Dashboard
  dashboard: {
    getSummary: () => request('/dashboard/summary', { method: 'GET' }),
  },

  // Settings
  settings: {
    get: () => request('/settings', { method: 'GET' }),
    update: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
};
