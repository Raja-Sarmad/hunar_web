"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Shield,
  Store,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react";
import DashboardShell from "@/components/dashboard-shell";
import {
  AdminCreateForm,
  AdminField,
  adminInputStyle,
} from "@/components/admin-create-form";
import { AdminAPI, type ApiUser } from "@/lib/api";
import { adminNav } from "@/lib/admin-nav";

type Filter = "all" | "user" | "provider";

export default function AdminUsersPage() {
  const params = useSearchParams();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [counts, setCounts] = useState({ pending: 0, requested: 0, users: 0 });
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    Promise.all([AdminAPI.users(), AdminAPI.stats()])
      .then(([u, s]) => {
        setUsers(u.users);
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
    if (params.get("new") === "1") setShowForm(true);
  }, [params]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => {
      if (filter !== "all" && u.role !== filter) return false;
      if (!needle) return true;
      return `${u.name} ${u.email} ${u.phone || ""}`
        .toLowerCase()
        .includes(needle);
    });
  }, [users, filter, q]);

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
      const res = await AdminAPI.createUser({
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""),
        password: String(fd.get("password") || ""),
        role: String(fd.get("role") || "user") as "user" | "provider",
      });
      setToast(res.message);
      setShowForm(false);
      e.currentTarget.reset();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${users.length})` },
    {
      id: "user",
      label: `Customers (${users.filter((u) => u.role === "user").length})`,
    },
    {
      id: "provider",
      label: `Providers (${users.filter((u) => u.role === "provider").length})`,
    },
  ];

  return (
    <DashboardShell
      requireRole="admin"
      title="Users & providers"
      subtitle="Create accounts, switch roles, or remove anyone who shouldn’t stay on HUNAR."
      nav={adminNav({ ...counts, users: users.length })}
    >
      {toast ? <div className="ad-toast">{toast}</div> : null}
      {error ? <p className="ad-error">{error}</p> : null}

      <div className="ad-toolbar">
        <label className="ad-search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone…"
            aria-label="Search users"
          />
        </label>
        <button
          type="button"
          className="ad-btn ad-btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          <UserPlus size={15} /> {showForm ? "Close form" : "Add user"}
        </button>
      </div>

      {showForm ? (
        <AdminCreateForm
          eyebrow="New account"
          title="Create customer or provider"
          hint="They can sign in immediately with the password you set."
          onSubmit={onCreate}
          actions={
            <>
              <button
                className="ad-btn ad-btn-primary"
                type="submit"
                disabled={creating}
              >
                <Plus size={14} /> {creating ? "Creating…" : "Create account"}
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
          <AdminField label="Full name">
            <input name="name" required maxLength={60} style={adminInputStyle} />
          </AdminField>
          <AdminField label="Email">
            <input name="email" type="email" required style={adminInputStyle} />
          </AdminField>
          <AdminField label="Phone">
            <input
              name="phone"
              type="tel"
              maxLength={20}
              placeholder="03xx xxxxxxx"
              style={adminInputStyle}
            />
          </AdminField>
          <AdminField label="Password">
            <input
              name="password"
              type="text"
              required
              minLength={6}
              placeholder="min 6 characters"
              style={adminInputStyle}
            />
          </AdminField>
          <AdminField label="Role">
            <select name="role" defaultValue="user" style={adminInputStyle}>
              <option value="user">Customer</option>
              <option value="provider">Provider</option>
            </select>
          </AdminField>
        </AdminCreateForm>
      ) : null}

      <div className="ad-filters" role="tablist" aria-label="Filter users">
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
          {users.length === 0
            ? "No users yet — create one above."
            : "No users match this filter."}
        </div>
      ) : (
        <ul className="ad-list ad-list-cards">
          {filtered.map((u) => {
            const initials = u.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <li className="ad-item ad-item-lift ad-userRow" key={u.id}>
                <div className="ad-itemHead">
                  <div className="ad-userMain">
                    <span className="ad-avatar ad-avatar-lg" aria-hidden>
                      {initials}
                    </span>
                    <div>
                      <div className="ad-label">
                        {u.role === "provider" ? "Provider" : "Customer"}
                      </div>
                      <h2>{u.name}</h2>
                      <p className="ad-meta">
                        {u.email}
                        {u.phone ? ` · ${u.phone}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`ad-pill ad-pill-role-${u.role}`}>
                    {u.role === "provider" ? (
                      <>
                        <Store size={12} /> provider
                      </>
                    ) : (
                      <>
                        <UserRound size={12} /> customer
                      </>
                    )}
                  </span>
                </div>
                <div className="ad-actions">
                  {u.role !== "provider" ? (
                    <button
                      className="ad-btn ad-btn-primary"
                      type="button"
                      disabled={busyId === u.id}
                      onClick={() =>
                        run(
                          u.id,
                          () => AdminAPI.setRole(u.id, "provider"),
                          `${u.name} is now a provider.`,
                        )
                      }
                    >
                      <Shield size={14} /> Make provider
                    </button>
                  ) : (
                    <button
                      className="ad-btn"
                      type="button"
                      disabled={busyId === u.id}
                      onClick={() =>
                        run(
                          u.id,
                          () => AdminAPI.setRole(u.id, "user"),
                          `${u.name} is now a customer.`,
                        )
                      }
                    >
                      <UserRound size={14} /> Make customer
                    </button>
                  )}
                  <button
                    className="ad-btn ad-btn-danger"
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Delete account for ${u.name}? This cannot be undone.`,
                        )
                      ) {
                        return;
                      }
                      run(
                        u.id,
                        () => AdminAPI.deleteUser(u.id),
                        "Account deleted.",
                      );
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardShell>
  );
}
