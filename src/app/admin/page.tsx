"use client";

import { FormEvent, useEffect, useState } from "react";
import { Flower } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("admin@hunar.pk");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.replace("/admin/overview");
    }
  }, [loading, user, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const next = await login(email, password);
      if (next.role !== "admin") {
        setError("This account is not an admin.");
        setPending(false);
        return;
      }
      router.push("/admin/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setPending(false);
    }
  };

  return (
    <div className="ad-auth">
      <div className="ad-authCard">
        <Link href="/" className="brand ad-authBrand" aria-label="Hunar home">
          <Flower />
          HUNAR
        </Link>
        <div className="eyebrow">CONTROL CENTRE</div>
        <h1 className="ad-title" style={{ fontSize: 28, marginTop: 8 }}>
          Run the whole marketplace
        </h1>
        <p className="ad-sub">
          Approve listings, steer orders, and manage every account from one
          place.
        </p>
        <form className="ad-form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className="ad-error">{error}</p> : null}
          <button className="primary" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
