import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin sign in | HUNAR",
  description: "Review new listings, manage services and follow up on bookings.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
