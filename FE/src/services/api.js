const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Chat & Messages
  sendMessage: (data) => request('/chat/message', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getSessionHistory: (sessionId) => request(`/chat/history/${sessionId}`),

  // Model Registry
  getModels: () => request('/models'),
  getModelDetails: (modelId) => request(`/models/${modelId}`),

  // Sessions
  getSessions: (username = '') => {
    const query = username ? `?username=${encodeURIComponent(username)}` : '';
    return request(`/sessions${query}`);
  },
  createSession: (data) => request('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteSession: (sessionId) => request(`/sessions/${sessionId}`, {
    method: 'DELETE',
  }),

  // Data Comparison with Database
  compareData: (data) => request('/comparison/compare', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getKnowledgeRecords: (category = '') => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/comparison/records${query}`);
  },
  createKnowledgeRecord: (data) => request('/comparison/records', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Users & Multi-Tenant Team Switching
  getUsers: () => request('/users'),
  createUser: (data) => request('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Health & Stats
  getStats: () => request('/health/stats'),
  checkReady: () => request('/health/ready'),
};
