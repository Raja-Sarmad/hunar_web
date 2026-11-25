export type AdminNavCounts = {
  pending?: number;
  requested?: number;
  users?: number;
};

export function adminNav(counts: AdminNavCounts = {}) {
  return [
    { href: "/admin/overview", label: "Overview" },
    {
      href: "/admin/listings",
      label: "Listings",
      count: counts.pending,
    },
    {
      href: "/admin/bookings",
      label: "Orders",
      count: counts.requested,
    },
    {
      href: "/admin/users",
      label: "Users",
      count: counts.users,
    },
    { href: "/admin/categories", label: "Categories" },
  ];
}
