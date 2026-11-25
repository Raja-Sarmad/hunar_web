"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Package,
  Plus,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import DashboardShell from "@/components/dashboard-shell";
import { AdminAPI } from "@/lib/api";
import { adminNav } from "@/lib/admin-nav";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    bookings: 0,
    users: 0,
    requested: 0,
  });
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AdminAPI.stats()
      .then((s) => {
        setStats(s);
        setLoaded(true);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load stats"),
      );
  }, []);

  const cards = [
    {
      key: "pending",
      label: "Pending listings",
      value: stats.pending,
      hint: "Waiting for approval",
      bg: "linear-gradient(160deg,#fff8eb,#ffe2b3)",
      border: "#efd09a",
      color: "#9a5b00",
      iconBg: "#fff3d6",
      icon: Package,
      href: "/admin/listings",
    },
    {
      key: "approved",
      label: "Live listings",
      value: stats.approved,
      hint: "On the marketplace",
      bg: "linear-gradient(160deg,#f0faf4,#cdeedc)",
      border: "#a9d9bf",
      color: "#1a6b3d",
      iconBg: "#ddf5e8",
      icon: CheckCircle2,
      href: "/admin/listings",
    },
    {
      key: "requested",
      label: "Open orders",
      value: stats.requested,
      hint: "Need follow-up",
      bg: "linear-gradient(160deg,#eef4ff,#d4e2ff)",
      border: "#b0c4ef",
      color: "#3557a0",
      iconBg: "#e4ecff",
      icon: ClipboardList,
      href: "/admin/bookings",
    },
    {
      key: "users",
      label: "Users",
      value: stats.users,
      hint: "Customers & providers",
      bg: "linear-gradient(160deg,#f5effc,#e0d0f6)",
      border: "#c9b3e8",
      color: "#6a45bd",
      iconBg: "#ebe0fb",
      icon: Users,
      href: "/admin/users",
    },
  ] as const;

  return (
    <DashboardShell
      requireRole="admin"
      title="Command centre"
      subtitle="Add talent, publish services, steer orders, and keep every account under control."
      nav={adminNav({
        pending: stats.pending,
        requested: stats.requested,
        users: stats.users,
      })}
    >
      {error ? <p className="ad-error">{error}</p> : null}

      <div className="ad-createBar">
        <div>
          <strong>Create from admin</strong>
          <p>Publish a live listing or open a new customer / provider account.</p>
        </div>
        <div className="ad-createBarActions">
          <Link href="/admin/listings?new=1" className="ad-btn ad-btn-primary">
            <Plus size={15} /> Add listing
          </Link>
          <Link href="/admin/users?new=1" className="ad-btn ad-btn-ghost">
            <UserPlus size={15} /> Add user
          </Link>
        </div>
      </div>

      <div className="ad-banner">
        <div className="ad-bannerIcon">
          <Sparkles size={20} />
        </div>
        <div>
          <strong>Full marketplace control</strong>
          <p>
            {loaded
              ? stats.pending > 0
                ? `${stats.pending} listing${stats.pending === 1 ? "" : "s"} waiting — review or add new ones anytime.`
                : "Queue is clear. Add a listing, create a user, or check open orders."
              : "Syncing live stats…"}
          </p>
        </div>
      </div>

      <div className="ad-stats ad-stats-rich">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.key}
              href={c.href}
              className="ad-stat ad-stat-rich"
              style={{
                background: c.bg,
                borderColor: c.border,
              }}
            >
              <div className="ad-statTop">
                <span style={{ color: c.color, fontWeight: 650 }}>{c.label}</span>
                <span
                  className="ad-statIcon"
                  style={{ background: c.iconBg, color: c.color }}
                >
                  <Icon size={16} />
                </span>
              </div>
              <strong style={{ color: c.color }}>{c.value}</strong>
              <em>{c.hint}</em>
            </Link>
          );
        })}
      </div>

      <div className="ad-sectionHead">
        <h2>Quick manage</h2>
        <p>Jump into the work that keeps HUNAR running.</p>
      </div>

      <div className="ad-actionGrid">
        <Link href="/admin/listings?new=1" className="ad-actionCard">
          <span className="ad-actionBadge">Create</span>
          <h3>Add a listing</h3>
          <p>Publish a service live instantly — assign a provider and go.</p>
          <span>
            Open form <ArrowRight size={14} />
          </span>
        </Link>
        <Link href="/admin/bookings" className="ad-actionCard">
          <span className="ad-actionBadge ad-actionBadge-soft">Orders</span>
          <h3>Track every order</h3>
          <p>Confirm, complete or cancel bookings across the marketplace.</p>
          <span>
            Manage orders <ArrowRight size={14} />
          </span>
        </Link>
        <Link href="/admin/users?new=1" className="ad-actionCard">
          <span className="ad-actionBadge">Create</span>
          <h3>Add an account</h3>
          <p>Create a customer or provider with email + password ready to log in.</p>
          <span>
            Open form <ArrowRight size={14} />
          </span>
        </Link>
      </div>

      <div className="ad-pulse">
        <div>
          <span className="ad-label">Marketplace pulse</span>
          <h3>{stats.bookings} total bookings</h3>
          <p>
            {stats.approved} live services · {stats.users} accounts ·{" "}
            {stats.requested} open right now
          </p>
        </div>
        <Link href="/admin/bookings" className="ad-btn ad-btn-primary">
          Open orders board
        </Link>
      </div>
    </DashboardShell>
  );
}
