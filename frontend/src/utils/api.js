const API_BASE = 'https://snaplink-backend-6fum.onrender.com';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('snaplink_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

    const text = await response.text();

    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Server returned invalid JSON');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;

  } catch (error) {

    if (
      error.name === 'TypeError' &&
      error.message === 'Failed to fetch'
    ) {
      throw new Error(
        'Cannot reach the server. Make sure backend is running on port 5000.'
      );
    }

    console.error(`API Fetch Error [${endpoint}]`, error.message);

    throw error;
  }
};