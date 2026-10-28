
const API_BASE = (
  import.meta.env.VITE_API_URL || 'https://backend-5gb0.onrender.com'
).replace(/\/+$/, '');

/**
 * Universal API helper:
 * - Attaches JWT token
 * - Sends JSON requests
 * - Parses API responses
 * - Handles authentication and connection errors
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('stockflow_token');

  // Ensure endpoint begins with /api
  const apiEndpoint = endpoint.startsWith('/api/')
    ? endpoint
    : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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
    const response = await fetch(`${API_BASE}${apiEndpoint}`, config);

    if (
      response.status === 401 &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/signup')
    ) {
      localStorage.removeItem('stockflow_token');
      localStorage.removeItem('stockflow_user');
      localStorage.removeItem('stockflow_org');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const contentType = response.headers.get('content-type') || '';

    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof data === 'object' && data !== null
          ? data.message || 'An error occurred while processing your request.'
          : data || 'An error occurred while processing your request.';

      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new Error(
        'Unable to connect to the backend server. Please verify the API is running.'
      );
    }

    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    signup: (data) =>
      request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    getMe: () => request('/auth/me'),
  },

  // Products
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();

      if (params.search) {
        query.append('search', params.search);
      }

      const queryString = query.toString()
        ? `?${query.toString()}`
        : '';

      return request(`/products${queryString}`);
    },

    getById: (id) => request(`/products/${id}`),

    create: (data) =>
      request('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    adjustStock: (id, { delta, note }) =>
      request(`/products/${id}/adjust-stock`, {
        method: 'PATCH',
        body: JSON.stringify({ delta, note }),
      }),

    delete: (id) =>
      request(`/products/${id}`, {
        method: 'DELETE',
      }),
  },

  // Dashboard
  dashboard: {
    getSummary: () => request('/dashboard/summary'),
  },

  // Settings
  settings: {
    get: () => request('/settings'),

    update: (data) =>
      request('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      
  },
};
