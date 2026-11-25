"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard-shell";
import ImagePicker from "@/components/image-picker";
import { adminNav } from "@/lib/admin-nav";
import {
  AdminAPI,
  CategoriesAPI,
  mediaUrl,
  type ApiCategory,
} from "@/lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [counts, setCounts] = useState({ pending: 0, requested: 0, users: 0 });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    Promise.all([CategoriesAPI.list(), AdminAPI.stats()])
      .then(([c, s]) => {
        setCategories(c.categories);
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
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <DashboardShell
      requireRole="admin"
      title="Category images"
      subtitle="Upload a photo for each marketplace category. These show on the home browse grid."
      nav={adminNav(counts)}
    >
      {toast ? <div className="ad-toast">{toast}</div> : null}
      {error ? <p className="ad-error">{error}</p> : null}

      <ul className="ad-list ad-list-cards">
        {categories.map((cat) => (
          <li className="ad-item ad-item-lift" key={cat.id}>
            <div className="ad-itemHead">
              <div>
                <div className="ad-label">Category {cat.index + 1}</div>
                <h2>{cat.name}</h2>
              </div>
              {cat.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl(cat.imageUrl)}
                  alt=""
                  className="catAdminThumb"
                />
              ) : (
                <span className={`iconTile ${cat.tone} catAdminFallback`}>
                  —
                </span>
              )}
            </div>
            <ImagePicker
              label={`Image for ${cat.name}`}
              value={cat.imageUrl || ""}
              onChange={async (imageUrl) => {
                try {
                  const res = await CategoriesAPI.update(cat.id, { imageUrl });
                  setToast(res.message);
                  load();
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Update failed",
                  );
                }
              }}
            />
          </li>
        ))}
      </ul>
    </DashboardShell>
  );
}
