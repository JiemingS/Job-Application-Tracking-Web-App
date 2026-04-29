const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');

async function request(path, options = {}, session) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed.');
  }

  return payload;
}

export const api = {
  getMe: (session) => request('/api/me', {}, session),
  updateMe: (body, session) => request('/api/me', { method: 'PUT', body: JSON.stringify(body) }, session),
  getDashboard: (session) => request('/api/dashboard', {}, session),
  listApplications: (session) => request('/api/applications', {}, session),
  createApplication: (body, session) => request('/api/applications', { method: 'POST', body: JSON.stringify(body) }, session),
  updateApplication: (id, body, session) => request(`/api/applications/${id}`, { method: 'PUT', body: JSON.stringify(body) }, session),
  deleteApplication: (id, session) => request(`/api/applications/${id}`, { method: 'DELETE' }, session)
};
