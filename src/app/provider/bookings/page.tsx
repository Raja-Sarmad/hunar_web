"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard-shell";
import { BookingsAPI, type ApiBooking } from "@/lib/api";

export default function ProviderBookingsPage() {
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
      requireRole="provider"
      title="Orders"
      subtitle="Confirm or decline customer requests. Changes sync live to the customer dashboard."
      nav={[
        { href: "/provider", label: "Overview" },
        { href: "/provider/listings", label: "Listings" },
        {
          href: "/provider/bookings",
          label: "Orders",
          count: bookings.filter((b) => b.status === "requested").length,
        },
        { href: "/provider/offer", label: "Offer a service" },
      ]}
    >
      {error ? <p className="ad-error">{error}</p> : null}
      {bookings.length === 0 ? (
        <div className="ad-empty">No orders yet.</div>
      ) : (
        <ul className="ad-list">
          {bookings.map((b) => (
            <li className="ad-item" key={b.id}>
              <div className="ad-itemHead">
                <div>
                  <div className="ad-label">{b.date}</div>
                  <h2>{b.serviceTitle}</h2>
                  <p className="ad-meta">
                    {b.customerName} · {b.customerPhone}
                  </p>
                </div>
                <span className={`ad-pill ad-pill-${b.status}`}>{b.status}</span>
              </div>
              <p className="ad-desc">{b.note}</p>
              <div className="ad-actions">
                {b.status === "requested" ? (
                  <>
                    <button
                      className="ad-btn ad-btn-primary"
                      type="button"
                      onClick={async () => {
                        await BookingsAPI.setStatus(b.id, "confirmed");
                        load();
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="ad-btn ad-btn-danger"
                      type="button"
                      onClick={async () => {
                        await BookingsAPI.setStatus(b.id, "cancelled");
                        load();
                      }}
                    >
                      Decline
                    </button>
                  </>
                ) : null}
                {b.status === "confirmed" ? (
                  <button
                    className="ad-btn"
                    type="button"
                    onClick={async () => {
                      await BookingsAPI.setStatus(b.id, "completed");
                      load();
                    }}
                  >
                    Mark completed
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
