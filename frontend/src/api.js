const VITE_API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

async function fetchJson(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...(options || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || `Error HTTP ${res.status}`);
  }
  return data;
}

export async function getBarrio() {
  return fetchJson(`${VITE_API_URL}/api/v1/barrio`);
}

export async function getPredios(params = {}) {
  const q = new URLSearchParams();
  if (params.destino_economico) q.set('destino_economico', params.destino_economico);
  if (params.estrato) q.set('estrato', String(params.estrato));
  if (params.q) q.set('q', params.q);
  const query = q.toString();
  const data = await fetchJson(`${VITE_API_URL}/api/v1/predios${query ? `?${query}` : ''}`);
  return data.data || data;
}

export async function getPredio(id) {
  return fetchJson(`${VITE_API_URL}/api/v1/predios/${id}`);
}

export async function createPredio(payload) {
  return fetchJson(`${VITE_API_URL}/api/v1/predios`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function updatePredio(id, payload) {
  return fetchJson(`${VITE_API_URL}/api/v1/predios/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deletePredio(id) {
  const res = await fetch(`${VITE_API_URL}/api/v1/predios/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Error HTTP ${res.status}`);
  }
  return { ok: true };
}
