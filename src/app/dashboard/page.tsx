"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard-shell";
import { BookingsAPI, type ApiBooking } from "@/lib/api";

export default function UserDashboardPage() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    BookingsAPI.list()
      .then((res) => setBookings(res.bookings))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      );
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 8000);
    return () => window.clearInterval(t);
  }, [load]);

  return (
    <DashboardShell
      requireRole="user"
      title="Your orders"
      subtitle="Track booking requests. Status updates live when providers or admins act."
      nav={[
        { href: "/dashboard", label: "Orders", count: bookings.length },
        { href: "/dashboard/saved", label: "Saved" },
        { href: "/dashboard/profile", label: "Profile" },
      ]}
    >
      {error ? <p className="ad-error">{error}</p> : null}
      <div className="ad-stats">
        <div className="ad-stat ad-stat-hi">
          <span>Open requests</span>
          <strong>
            {bookings.filter((b) => b.status === "requested").length}
          </strong>
        </div>
        <div className="ad-stat">
          <span>Confirmed</span>
          <strong>
            {bookings.filter((b) => b.status === "confirmed").length}
          </strong>
        </div>
        <div className="ad-stat">
          <span>Completed</span>
          <strong>
            {bookings.filter((b) => b.status === "completed").length}
          </strong>
        </div>
        <div className="ad-stat">
          <span>Total</span>
          <strong>{bookings.length}</strong>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="ad-empty">
          No orders yet.{" "}
          <Link href="/" style={{ color: "var(--violet)", fontWeight: 600 }}>
            Explore services
          </Link>
        </div>
      ) : (
        <ul className="ad-list">
          {bookings.map((b) => (
            <li className="ad-item" key={b.id}>
              <div className="ad-itemHead">
                <div>
                  <div className="ad-label">Order</div>
                  <h2>{b.serviceTitle}</h2>
                  <p className="ad-meta">
                    Provider: {b.providerName} · Date: {b.date}
                  </p>
                </div>
                <span className={`ad-pill ad-pill-${b.status}`}>{b.status}</span>
              </div>
              <p className="ad-desc">{b.note}</p>
              <div className="ad-actions">
                {b.status === "requested" || b.status === "confirmed" ? (
                  <button
                    className="ad-btn ad-btn-danger"
                    type="button"
                    onClick={async () => {
                      await BookingsAPI.setStatus(b.id, "cancelled");
                      load();
                    }}
                  >
                    Cancel order
                  </button>
                ) : null}
                <Link className="ad-btn" href="/">
                  Browse more
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
