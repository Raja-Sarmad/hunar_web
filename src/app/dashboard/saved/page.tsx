"use client";

import Link from "next/link";
import DashboardShell from "@/components/dashboard-shell";

export default function SavedPage() {
  return (
    <DashboardShell
      requireRole="user"
      title="Saved services"
      subtitle="Heart listings on the marketplace to keep them handy while browsing."
      nav={[
        { href: "/dashboard", label: "Orders" },
        { href: "/dashboard/saved", label: "Saved" },
        { href: "/dashboard/profile", label: "Profile" },
      ]}
    >
      <div className="ad-empty">
        Open the marketplace and tap the heart on a service.{" "}
        <Link href="/" style={{ color: "var(--violet)", fontWeight: 600 }}>
          Browse now
        </Link>
      </div>
    </DashboardShell>
  );
}
