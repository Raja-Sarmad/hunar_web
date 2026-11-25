"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  Flower,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Package,
  Store,
  Users,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import type { ApiUser } from "@/lib/api";

type NavItem = { href: string; label: string; count?: number };

const TAB_ICONS: Record<string, typeof LayoutDashboard> = {
  "/admin/overview": LayoutDashboard,
  "/admin/listings": Package,
  "/admin/bookings": ClipboardList,
  "/admin/users": Users,
  "/admin/categories": LayoutGrid,
  "/provider": Store,
  "/provider/listings": Package,
  "/provider/bookings": ClipboardList,
  "/dashboard": LayoutDashboard,
  "/dashboard/saved": Package,
  "/dashboard/profile": Users,
};

export default function DashboardShell({
  title,
  subtitle,
  nav,
  children,
  requireRole,
}: {
  title: string;
  subtitle: string;
  nav: NavItem[];
  children: ReactNode;
  requireRole: ApiUser["role"];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const isAdmin = requireRole === "admin";

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== requireRole) {
      router.replace(
        requireRole === "admin"
          ? "/admin"
          : `/login?role=${requireRole}&next=${encodeURIComponent(pathname)}`,
      );
    }
  }, [loading, user, requireRole, router, pathname]);

  if (loading || !user || user.role !== requireRole) {
    return (
      <div className={`ad-shell ${isAdmin ? "ad-shell-admin" : ""}`}>
        <div className="wrap ad-main">
          <div className="ad-loading">
            <span className="ad-spinner" />
            Loading dashboard…
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`ad-shell ${isAdmin ? "ad-shell-admin" : ""}`}>
      <div className={`ad-top ${isAdmin ? "ad-top-admin" : ""}`}>
        <div className="wrap ad-topInner">
          <div className="ad-topLeft">
            <Link href="/" className="brand ad-brand">
              <Flower />
              HUNAR
            </Link>
            <span className={`ad-tag ${isAdmin ? "ad-tag-admin" : ""}`}>
              {isAdmin ? "Control centre" : requireRole}
            </span>
          </div>
          <div
            className="ad-topTools"
            style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
          >
            {isAdmin ? (
              <Link href="/" className="ad-btn ad-btn-ghost">
                <Store size={14} /> Marketplace
              </Link>
            ) : null}
            <div
              className="ad-userChip"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span className="ad-avatar" aria-hidden>
                {initials}
              </span>
              <span className="ad-email">{user.email}</span>
            </div>
            <button
              className="ad-btn"
              type="button"
              onClick={() => {
                logout();
                router.push(requireRole === "admin" ? "/admin" : "/login");
              }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="wrap ad-main">
        <div className={`ad-heroHead ${isAdmin ? "ad-heroHead-admin" : ""}`}>
          <div>
            <div className="eyebrow">HUNAR / {requireRole.toUpperCase()}</div>
            <h1 className="ad-title">{title}</h1>
            <p className="ad-sub">{subtitle}</p>
          </div>
        </div>

        <nav
          className={`ad-tabs ${isAdmin ? "ad-tabs-admin" : ""}`}
          aria-label="Dashboard sections"
        >
          {nav.map((item) => {
            const Icon = TAB_ICONS[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {Icon ? <Icon size={15} /> : null}
                {item.label}
                {typeof item.count === "number" ? (
                  <span className="ad-count">{item.count}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
