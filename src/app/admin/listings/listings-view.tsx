"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Plus, Search, Trash2, X } from "lucide-react";
import DashboardShell from "@/components/dashboard-shell";
import {
  AdminCreateForm,
  AdminField,
  adminInputStyle,
} from "@/components/admin-create-form";
import ImagePicker from "@/components/image-picker";
import { CATEGORY_META, CITIES, formatPrice } from "@/lib/data";
import {
  AdminAPI,
  ListingsAPI,
  mediaUrl,
  type ApiListing,
  type ApiUser,
} from "@/lib/api";
import { adminNav } from "@/lib/admin-nav";

type Filter = "all" | "pending" | "approved" | "rejected";

export default function AdminListingsPage() {
  const params = useSearchParams();
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [providers, setProviders] = useState<ApiUser[]>([]);
  const [counts, setCounts] = useState({ pending: 0, requested: 0, users: 0 });
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const load = useCallback(() => {
    Promise.all([ListingsAPI.allForAdmin(), AdminAPI.stats(), AdminAPI.users()])
      .then(([res, s, u]) => {
        setListings(res.listings);
        setCounts({
          pending: s.pending,
          requested: s.requested,
          users: s.users,
        });
        setProviders(u.users.filter((x) => x.role === "provider"));
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
    if (params.get("new") === "1") setShowForm(true);
  }, [params]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return listings.filter((l) => {
      if (filter !== "all" && l.status !== filter) return false;
      if (!needle) return true;
      return `${l.title} ${l.name} ${l.city} ${l.desc}`
        .toLowerCase()
        .includes(needle);
    });
  }, [listings, filter, q]);

  const run = async (id: string, action: () => Promise<unknown>, msg: string) => {
    setBusyId(id);
    setError("");
    try {
      await action();
      setToast(msg);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const cat = Number(fd.get("cat") || 0);
      const res = await ListingsAPI.create({
        title: String(fd.get("title") || ""),
        phone: String(fd.get("phone") || ""),
        desc: String(fd.get("desc") || ""),
        city: String(fd.get("city") || ""),
        cat,
        price: Number(fd.get("price") || 0),
        image: cat,
        imageUrl,
        providerId: String(fd.get("providerId") || "") || undefined,
        providerName: String(fd.get("providerName") || "") || undefined,
      });
      setToast(res.message);
      setShowForm(false);
      setImageUrl("");
      e.currentTarget.reset();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${listings.length})` },
    {
      id: "pending",
      label: `Pending (${listings.filter((l) => l.status === "pending").length})`,
    },
    {
      id: "approved",
      label: `Live (${listings.filter((l) => l.status === "approved").length})`,
    },
    {
      id: "rejected",
      label: `Rejected (${listings.filter((l) => l.status === "rejected").length})`,
    },
  ];

  return (
    <DashboardShell
      requireRole="admin"
      title="Manage listings"
      subtitle="Add a live service yourself, or approve / reject / delete provider offers."
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
            placeholder="Search title, provider, city…"
            aria-label="Search listings"
          />
        </label>
        <button
          type="button"
          className="ad-btn ad-btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus size={15} /> {showForm ? "Close form" : "Add listing"}
        </button>
      </div>

      {showForm ? (
        <AdminCreateForm
          eyebrow="New listing"
          title="Publish a service live"
          hint="Admin-created listings go live immediately on the marketplace."
          onSubmit={onCreate}
          actions={
            <>
              <button
                className="ad-btn ad-btn-primary"
                type="submit"
                disabled={creating}
              >
                <Plus size={14} /> {creating ? "Publishing…" : "Publish live"}
              </button>
              <button
                className="ad-btn"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </>
          }
        >
          <AdminField label="Service title">
            <input
              name="title"
              required
              maxLength={70}
              placeholder="e.g. Custom bridal henna"
              style={adminInputStyle}
            />
          </AdminField>
          <AdminField label="Starting price (PKR)">
            <input
              type="number"
              name="price"
              min={1}
              max={1000000}
              required
              style={adminInputStyle}
            />
          </AdminField>
          <AdminField label="Category">
            <select name="cat" defaultValue={0} style={adminInputStyle}>
              {CATEGORY_META.map((cat, i) => (
                <option key={cat.name} value={i}>
                  {cat.name}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="City">
            <select name="city" defaultValue={CITIES[0]} style={adminInputStyle}>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Contact phone">
            <input
              name="phone"
              type="tel"
              required
              maxLength={20}
              placeholder="03xx xxxxxxx"
              style={adminInputStyle}
            />
          </AdminField>
          <AdminField label="Assign provider">
            <select name="providerId" defaultValue="" style={adminInputStyle}>
              <option value="">Me (admin) as publisher</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.email}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Display name override (optional)" full>
            <input
              name="providerName"
              maxLength={60}
              placeholder="Only if not assigning a provider account"
              style={adminInputStyle}
            />
          </AdminField>
          <AdminField label="Service image" full>
            <ImagePicker value={imageUrl} onChange={setImageUrl} />
          </AdminField>
          <AdminField label="About this service" full>
            <textarea
              name="desc"
              required
              maxLength={600}
              rows={4}
              style={{ ...adminInputStyle, minHeight: 110, resize: "vertical" }}
            />
          </AdminField>
        </AdminCreateForm>
      ) : null}

      <div className="ad-filters" role="tablist" aria-label="Filter listings">
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

      {filtered.length === 0 ? (
        <div className="ad-empty">
          {listings.length === 0
            ? "No listings yet — add one above or wait for providers."
            : "No listings match this filter."}
        </div>
      ) : (
        <ul className="ad-list ad-list-cards">
          {filtered.map((l) => (
            <li className="ad-item ad-item-lift" key={l.id}>
              <div className="ad-itemHead">
                <div className="ad-userMain">
                  {l.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(l.imageUrl)}
                      alt=""
                      className="catAdminThumb"
                    />
                  ) : null}
                  <div>
                    <div className="ad-label">
                      {CATEGORY_META[l.cat]?.name || "Service"} · {l.city}
                    </div>
                    <h2>{l.title}</h2>
                    <p className="ad-meta">
                      {l.name}
                      {l.phone ? ` · ${l.phone}` : ""} · From{" "}
                      {formatPrice(l.price)}
                    </p>
                  </div>
                </div>
                <span className={`ad-pill ad-pill-${l.status}`}>{l.status}</span>
              </div>
              <p className="ad-desc">{l.desc}</p>
              <div className="ad-actions">
                {l.status !== "approved" ? (
                  <button
                    className="ad-btn ad-btn-primary"
                    type="button"
                    disabled={busyId === l.id}
                    onClick={() =>
                      run(
                        l.id,
                        () => ListingsAPI.setStatus(l.id, "approved"),
                        "Listing approved — now live.",
                      )
                    }
                  >
                    <Check size={14} /> Approve live
                  </button>
                ) : null}
                {l.status !== "rejected" ? (
                  <button
                    className="ad-btn"
                    type="button"
                    disabled={busyId === l.id}
                    onClick={() =>
                      run(
                        l.id,
                        () => ListingsAPI.setStatus(l.id, "rejected"),
                        "Listing rejected.",
                      )
                    }
                  >
                    <X size={14} /> Reject
                  </button>
                ) : null}
                <button
                  className="ad-btn ad-btn-danger"
                  type="button"
                  disabled={busyId === l.id}
                  onClick={() => {
                    if (!window.confirm(`Delete “${l.title}”?`)) return;
                    run(
                      l.id,
                      () => ListingsAPI.remove(l.id),
                      "Listing deleted.",
                    );
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
