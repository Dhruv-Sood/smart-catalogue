const BASE = 'http://localhost:3001';

export const api = {
  // Analyze
  analyzeImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return fetch(`${BASE}/api/catalog/analyze/image`, { method: 'POST', body: fd }).then(r => r.json());
  },
  analyzeText: (description) =>
    fetch(`${BASE}/api/catalog/analyze/text`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    }).then(r => r.json()),
  analyzeCombined: (file, description) => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('description', description);
    return fetch(`${BASE}/api/catalog/analyze/combined`, { method: 'POST', body: fd }).then(r => r.json());
  },
  analyzeBatch: (products) =>
    fetch(`${BASE}/api/catalog/analyze/batch`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products }),
    }).then(r => r.json()),

  // Catalog CRUD
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/api/catalog${q ? '?' + q : ''}`).then(r => r.json());
  },
  stats: () => fetch(`${BASE}/api/catalog/stats`).then(r => r.json()),
  get: (id) => fetch(`${BASE}/api/catalog/${id}`).then(r => r.json()),
  update: (id, data) =>
    fetch(`${BASE}/api/catalog/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  publish: (id) =>
    fetch(`${BASE}/api/catalog/${id}/publish`, { method: 'POST' }).then(r => r.json()),
  delete: (id) =>
    fetch(`${BASE}/api/catalog/${id}`, { method: 'DELETE' }),
  health: () => fetch(`${BASE}/health`).then(r => r.json()),
};
