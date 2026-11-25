"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Flower } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"user" | "provider">("user");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const user = await signup({ name, email, phone, password, role });
      router.push(user.role === "provider" ? "/provider" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
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
        <div className="eyebrow">JOIN HUNAR</div>
        <h1 className="ad-title" style={{ fontSize: 28, marginTop: 8 }}>
          Create your account
        </h1>
        <p className="ad-sub">
          Book local skills as a customer, or offer a service as a provider.
        </p>
        <form className="ad-form" onSubmit={onSubmit}>
          <label>
            Full name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
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
            Phone
            <input
              type="tel"
              placeholder="03xx xxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label>
            I want to
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "provider")}
            >
              <option value="user">Book services</option>
              <option value="provider">Offer a service</option>
            </select>
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className="ad-error">{error}</p> : null}
          <button className="primary" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="ad-sub" style={{ marginTop: 18 }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
