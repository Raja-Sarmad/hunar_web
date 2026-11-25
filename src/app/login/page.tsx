"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Flower } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { ApiUser } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const roleHint = params.get("role") || "user";
  const next = params.get("next");

  const [email, setEmail] = useState(
    roleHint === "provider"
      ? "ayesha@example.com"
      : roleHint === "admin"
        ? "admin@hunar.pk"
        : "fatima@example.com",
  );
  const [password, setPassword] = useState(
    roleHint === "admin" ? "admin123" : "demo123",
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const redirectFor = (user: ApiUser) => {
    if (next) router.push(next);
    else if (user.role === "provider") router.push("/provider");
    else if (user.role === "admin") router.push("/admin/overview");
    else router.push("/dashboard");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const user = await login(email, password);
      redirectFor(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setPending(false);
    }
  };

  return (
    <div className="ad-auth">
      <div className="ad-authCard">
        <Link href="/" className="brand ad-authBrand">
          <Flower />
          HUNAR
        </Link>
        <div className="eyebrow">SIGN IN</div>
        <h1 className="ad-title" style={{ fontSize: 28, marginTop: 8 }}>
          Welcome back
        </h1>
        <p className="ad-sub">
          Use your HUNAR account. Demo: fatima / ayesha / admin emails after
          seeding.
        </p>
        <form className="ad-form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
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
        <p className="ad-sub" style={{ marginTop: 18 }}>
          New here? <Link href="/signup">Create an account</Link>
          {" · "}
          <Link href="/admin">Admin panel</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="ad-auth">
          <p className="ad-sub">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
