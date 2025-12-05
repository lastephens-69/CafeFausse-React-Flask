const API_BASE = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, "")) || 'http://localhost:5000'

export async function subscribeNewsletter({ name, email, phone }) {
  const res = await fetch(`${API_BASE}/api/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone })
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Subscription failed')
  }
  return res.json()
}

export async function createReservation({ time_slot, party_size, name, email, phone }) {
  const res = await fetch(`${API_BASE}/api/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ time_slot, party_size, name, email, phone })
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Reservation failed')
  }
  return res.json()
}

/* -------- Admin (read-only) -------- */
async function request(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}


const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

const adminHeaders = {
  "X-Admin-Token": ADMIN_TOKEN,
};

export function getAdminSummary() {
  return request(`/api/admin/summary`, { headers: adminHeaders });
}

export function getAdminCustomers() {
  return request(`/api/admin/customers`, { headers: adminHeaders });
}

export function getAdminReservations() {
  return request(`/api/admin/reservations`, { headers: adminHeaders });
}