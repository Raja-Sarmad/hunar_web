"use client";

import { FormEvent, useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard-shell";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await updateProfile({ name, phone });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <DashboardShell
      requireRole="user"
      title="Your profile"
      subtitle="Update how providers see your contact details."
      nav={[
        { href: "/dashboard", label: "Orders" },
        { href: "/dashboard/saved", label: "Saved" },
        { href: "/dashboard/profile", label: "Profile" },
      ]}
    >
      <form className="ad-form" style={{ maxWidth: 480 }} onSubmit={onSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Email
          <input value={user?.email || ""} disabled />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        {error ? <p className="ad-error">{error}</p> : null}
        <button className="primary" type="submit">
          Save profile
        </button>
        {saved ? <p className="demo">Profile updated.</p> : null}
      </form>
    </DashboardShell>
  );
}
