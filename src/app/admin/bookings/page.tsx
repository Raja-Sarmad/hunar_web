"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleCheck,
  Search,
  XCircle,
} from "lucide-react";
import DashboardShell from "@/components/dashboard-shell";
import { AdminAPI, BookingsAPI, type ApiBooking } from "@/lib/api";
import { adminNav } from "@/lib/admin-nav";

type Filter = "all" | "requested" | "confirmed" | "completed" | "cancelled";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [counts, setCounts] = useState({ pending: 0, requested: 0, users: 0 });
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([BookingsAPI.list(), AdminAPI.stats()])
      .then(([b, s]) => {
        setBookings(b.bookings);
        setCounts({
          pending: s.pending,
          requested: s.requested,
          users: s.users,
        });
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      );
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 8000);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!needle) return true;
      return `${b.serviceTitle} ${b.customerName} ${b.providerName} ${b.note}`
        .toLowerCase()
        .includes(needle);
    });
  }, [bookings, filter, q]);

  const run = async (
    id: string,
    status: ApiBooking["status"],
    msg: string,
  ) => {
    setBusyId(id);
    setError("");
    try {
      await BookingsAPI.setStatus(id, status);
      setToast(msg);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${bookings.length})` },
    {
      id: "requested",
      label: `Open (${bookings.filter((b) => b.status === "requested").length})`,
    },
    {
      id: "confirmed",
      label: `Confirmed (${bookings.filter((b) => b.status === "confirmed").length})`,
    },
    {
      id: "completed",
      label: `Done (${bookings.filter((b) => b.status === "completed").length})`,
    },
    {
      id: "cancelled",
      label: `Cancelled (${bookings.filter((b) => b.status === "cancelled").length})`,
    },
  ];

  return (
    <DashboardShell
      requireRole="admin"
      title="Orders board"
      subtitle="Every booking across HUNAR — confirm, complete or cancel. Changes sync to customer and provider dashboards."
      nav={adminNav(counts)}
    >
      {toast ? <div className="ad-toast">{toast}</div> : null}
      {error ? <p className="ad-error">{error}</p> : null}

      <div className="ad-toolbar">
        <label className="ad-search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search service, customer, provider…"
            aria-label="Search orders"
          />
        </label>
        <div className="ad-filters" role="tablist" aria-label="Filter orders">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={filter === f.id ? "active" : ""}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ad-empty">
          {bookings.length === 0
            ? "No orders yet — bookings will land here once customers request a service."
            : "No orders match this filter."}
        </div>
      ) : (
        <ul className="ad-list ad-list-cards">
          {filtered.map((b) => (
            <li className="ad-item ad-item-lift" key={b.id}>
              <div className="ad-itemHead">
                <div>
                  <div className="ad-label">Preferred date · {b.date}</div>
                  <h2>{b.serviceTitle}</h2>
                  <p className="ad-meta">
                    Customer: <strong>{b.customerName}</strong> ·{" "}
                    {b.customerPhone}
                    {b.customerEmail ? ` · ${b.customerEmail}` : ""}
                  </p>
                  <p className="ad-meta">
                    Provider: <strong>{b.providerName}</strong>
                  </p>
                </div>
                <span className={`ad-pill ad-pill-${b.status}`}>{b.status}</span>
              </div>
              {b.note ? <p className="ad-desc">{b.note}</p> : null}
              <div className="ad-actions">
                <button
                  className="ad-btn ad-btn-primary"
                  type="button"
                  disabled={busyId === b.id || b.status === "confirmed"}
                  onClick={() =>
                    run(b.id, "confirmed", "Order confirmed.")
                  }
                >
                  <CheckCircle2 size={14} /> Confirm
                </button>
                <button
                  className="ad-btn"
                  type="button"
                  disabled={busyId === b.id || b.status === "completed"}
                  onClick={() =>
                    run(b.id, "completed", "Order marked completed.")
                  }
                >
                  <CircleCheck size={14} /> Complete
                </button>
                <button
                  className="ad-btn ad-btn-danger"
                  type="button"
                  disabled={busyId === b.id || b.status === "cancelled"}
                  onClick={() => {
                    if (!window.confirm("Cancel this order?")) return;
                    run(b.id, "cancelled", "Order cancelled.");
                  }}
                >
                  <XCircle size={14} /> Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
