import { useEffect, useMemo, useState } from "react";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

/* ----------------- helpers ----------------- */

// "YYYY-MM-DD HH:MM" -> Date
function parseYYYYMMDD_HHMM(s) {
  if (!s) return null;
  // make it ISO-ish for Date()
  return new Date(s.replace(" ", "T") + ":00");
}

function formatDayLong(d) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function formatTimeShort(d) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
function formatDateTimeShort(d) {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// fetch + robust JSON parse (surface HTML errors cleanly)
async function getJSON(url) {
  const headers = { "Content-Type": "application/json" };
  if (ADMIN_TOKEN) headers["dev-secret-123"] = ADMIN_TOKEN;

  const res = await fetch(url, { headers });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON but got: ${text.slice(0, 200)}`);
  }
}

/* ----------------- component ----------------- */

export default function Admin() {
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [resv, cust] = await Promise.all([
          getJSON(`${API}/api/admin/reservations`),
          getJSON(`${API}/api/admin/customers`),
        ]);

        // normalize dates to Date objects (for sorting/formatting)
        const R = (resv || []).map((r) => ({
          ...r,
          _time: parseYYYYMMDD_HHMM(r.time_slot),
          _created: r.created_at ? parseYYYYMMDD_HHMM(r.created_at) : null,
        }));
        const C = (cust || []).map((c) => ({
          ...c,
          _created: c.created_at ? parseYYYYMMDD_HHMM(c.created_at) : null,
        }));

        setReservations(R);
        setCustomers(C);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group reservations by day -> slot (HH:MM)
  const grouped = useMemo(() => {
    const byDay = new Map(); // key=YYYY-MM-DD

    for (const r of reservations) {
      if (!r._time) continue;
      const dayKey = r.time_slot.slice(0, 10); // "YYYY-MM-DD"
      const slotKey = r.time_slot.slice(11);   // "HH:MM"

      if (!byDay.has(dayKey)) {
        byDay.set(dayKey, {
          date: new Date(`${dayKey}T00:00:00`),
          total: 0,
          slots: new Map(), // key=HH:MM -> { time: Date, rows: [] }
        });
      }
      const day = byDay.get(dayKey);
      day.total += 1;

      if (!day.slots.has(slotKey)) {
        day.slots.set(slotKey, { time: new Date(`${dayKey}T${slotKey}:00`), rows: [] });
      }
      day.slots.get(slotKey).rows.push(r);
    }

    const days = Array.from(byDay.entries()).map(([key, val]) => ({
      key,
      date: val.date,
      total: val.total,
      slots: Array.from(val.slots.entries())
        .map(([sKey, sVal]) => ({ key: sKey, ...sVal, count: sVal.rows.length }))
        .sort((a, b) => a.time - b.time),
    }));

    // newest day first
    days.sort((a, b) => b.date - a.date);
    return days;
  }, [reservations]);

  return (
    <div style={{ padding: "2rem 1rem", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 10px", fontFamily: '"Playfair Display", serif' }}>
        Admin <span style={{ fontSize: 14, color: "#888" }}>(read-only)</span>
      </h1>

      {err && (
        <div style={alertErr}>
          {err}
        </div>
      )}

      {loading ? (
        <div style={{ opacity: 0.8 }}>Loading…</div>
      ) : (
        <>
          {/* Reservations (grouped) */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={h2}>Reservations</h2>

            {grouped.length === 0 && <div style={{ color: "#666" }}>No reservations yet.</div>}

            {grouped.map((day) => (
              <div key={day.key} style={card}>
                <div style={cardHeader}>
                  <div style={{ fontWeight: 700 }}>{formatDayLong(day.date)}</div>
                  <div>{day.total} total</div>
                </div>

                {day.slots.map((slot) => (
                  <div key={slot.key} style={{ borderTop: "1px solid #eee" }}>
                    <div style={slotHeader}>
                      <div style={{ fontWeight: 600 }}>{formatTimeShort(slot.time)}</div>
                      <div>{slot.count} reservation{slot.count !== 1 ? "s" : ""}</div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table style={table}>
                        <thead>
                          <tr>
                            <th style={th}>ID</th>
                            <th style={th}>Customer</th>
                            <th style={th}>Email</th>
                            <th style={th}>Phone</th>
                            <th style={th}>Party</th>
                            <th style={th}>Table</th>
                            <th style={th}>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slot.rows.map((r) => (
                            <tr key={r.id}>
                              <td style={td}>{r.id}</td>
                              <td style={td}>{r.customer?.name || "—"}</td>
                              <td style={td}>{r.customer?.email || "—"}</td>
                              <td style={td}>{r.customer?.phone || "—"}</td>
                              <td style={td}>{r.party_size}</td>
                              <td style={td}>{r.table_number}</td>
                              <td style={td}>{r._created ? formatDateTimeShort(r._created) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>

          {/* Customers */}
          <section>
            <h2 style={h2}>Customers</h2>
            {customers.length === 0 ? (
              <div style={{ color: "#666" }}>No customers yet.</div>
            ) : (
              <div style={card}>
                <div style={{ overflowX: "auto" }}>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th style={th}>ID</th>
                        <th style={th}>Name</th>
                        <th style={th}>Email</th>
                        <th style={th}>Phone</th>
                        <th style={th}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers
                        .slice()
                        .sort((a, b) => (b._created || 0) - (a._created || 0))
                        .map((c) => (
                          <tr key={c.id}>
                            <td style={td}>{c.id}</td>
                            <td style={td}>{c.name}</td>
                            <td style={td}>{c.email}</td>
                            <td style={td}>{c.phone || "—"}</td>
                            <td style={td}>{c._created ? formatDateTimeShort(c._created) : "—"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

/* ----------------- styles ----------------- */
const card = {
  border: "1px solid #eee",
  borderRadius: 10,
  overflow: "hidden",
  marginBottom: 20,
  background: "#fff",
};
const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#111",
  color: "#bfa14a",
  padding: "10px 14px",
};
const slotHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#fafafa",
  padding: "8px 14px",
};
const table = {
  width: "100%",
  borderCollapse: "collapse",
};
const th = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
  fontWeight: 700,
};
const td = {
  padding: "10px 12px",
  borderTop: "1px solid #f4f4f4",
  whiteSpace: "nowrap",
};
const h2 = { margin: "12px 0 10px", fontFamily: '"Playfair Display", serif' };
const alertErr = {
  background: "#ffecec",
  border: "1px solid #f5a5a5",
  color: "#a40000",
  padding: "10px 12px",
  borderRadius: 8,
  margin: "10px 0 16px",
};
