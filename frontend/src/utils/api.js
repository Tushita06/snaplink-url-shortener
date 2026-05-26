const API_BASE = 'http://localhost:5000/api';

/**
 * Standardized API client for clean and DRY requests
 */
export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('snaplink_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.');
    }
    console.error(`API Fetch Error [${endpoint}]:`, error.message);
    throw error;
  }
};
