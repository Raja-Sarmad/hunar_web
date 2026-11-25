"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard-shell";
import { CATEGORY_META, formatPrice } from "@/lib/data";
import {
  BookingsAPI,
  ListingsAPI,
  type ApiBooking,
  type ApiListing,
} from "@/lib/api";

export default function ProviderHomePage() {
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    Promise.all([ListingsAPI.mine(), BookingsAPI.list()])
      .then(([l, b]) => {
        setListings(l.listings);
        setBookings(b.bookings);
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

  return (
    <DashboardShell
      requireRole="provider"
      title="Provider studio"
      subtitle="Manage listings and orders. Admin approval publishes listings live."
      nav={[
        { href: "/provider", label: "Overview" },
        {
          href: "/provider/listings",
          label: "Listings",
          count: listings.length,
        },
        {
          href: "/provider/bookings",
          label: "Orders",
          count: bookings.filter((b) => b.status === "requested").length,
        },
        { href: "/provider/offer", label: "Offer a service" },
      ]}
    >
      {error ? <p className="ad-error">{error}</p> : null}
      <div className="ad-stats">
        <div className="ad-stat ad-stat-hi">
          <span>Live listings</span>
          <strong>
            {listings.filter((l) => l.status === "approved").length}
          </strong>
        </div>
        <div className="ad-stat">
          <span>Pending review</span>
          <strong>
            {listings.filter((l) => l.status === "pending").length}
          </strong>
        </div>
        <div className="ad-stat">
          <span>New orders</span>
          <strong>
            {bookings.filter((b) => b.status === "requested").length}
          </strong>
        </div>
        <div className="ad-stat">
          <span>Total orders</span>
          <strong>{bookings.length}</strong>
        </div>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Recent orders</h2>
      {bookings.length === 0 ? (
        <div className="ad-empty">
          No orders yet.{" "}
          <Link
            href="/provider/offer"
            style={{ color: "var(--violet)", fontWeight: 600 }}
          >
            Offer a service
          </Link>
        </div>
      ) : (
        <ul className="ad-list">
          {bookings.slice(0, 5).map((b) => (
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

      <h2 style={{ fontSize: 18, margin: "28px 0 12px" }}>Your listings</h2>
      <ul className="ad-list">
        {listings.map((l) => (
          <li className="ad-item" key={l.id}>
            <div className="ad-itemHead">
              <div>
                <div className="ad-label">
                  {CATEGORY_META[l.cat]?.name} · {l.city}
                </div>
                <h2>{l.title}</h2>
                <p className="ad-meta">From {formatPrice(l.price)}</p>
              </div>
              <span className={`ad-pill ad-pill-${l.status}`}>{l.status}</span>
            </div>
            <p className="ad-desc">{l.desc}</p>
          </li>
        ))}
      </ul>
    </DashboardShell>
  );
}
