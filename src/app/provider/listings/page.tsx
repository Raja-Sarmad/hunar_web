"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard-shell";
import { CATEGORY_META, formatPrice } from "@/lib/data";
import { ListingsAPI, type ApiListing } from "@/lib/api";

export default function ProviderListingsPage() {
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    ListingsAPI.mine()
      .then((res) => setListings(res.listings))
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
      title="Your listings"
      subtitle="Approved listings appear on the marketplace. Pending ones wait for admin review."
      nav={[
        { href: "/provider", label: "Overview" },
        { href: "/provider/listings", label: "Listings", count: listings.length },
        { href: "/provider/bookings", label: "Orders" },
        { href: "/provider/offer", label: "Offer a service" },
      ]}
    >
      {error ? <p className="ad-error">{error}</p> : null}
      {listings.length === 0 ? (
        <div className="ad-empty">No listings yet.</div>
      ) : (
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
              <div className="ad-actions">
                <button
                  className="ad-btn ad-btn-danger"
                  type="button"
                  onClick={async () => {
                    await ListingsAPI.remove(l.id);
                    load();
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
