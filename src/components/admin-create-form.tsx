"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";

export function AdminCreateForm({
  eyebrow,
  title,
  hint,
  onSubmit,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  hint: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        background: "#fff",
        border: "1px solid #e0d4f0",
        borderRadius: 18,
        padding: 22,
        marginBottom: 18,
        boxShadow: "0 14px 36px rgba(38,24,56,0.08)",
        display: "block",
        width: "100%",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div className="ad-label">{eyebrow}</div>
        <h2
          style={{
            margin: "6px 0 6px",
            fontSize: 20,
            letterSpacing: "-0.4px",
            fontWeight: 650,
          }}
        >
          {title}
        </h2>
        <p className="ad-meta" style={{ margin: 0 }}>
          {hint}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 18,
          width: "100%",
        }}
      >
        {children}
      </div>

      <div className="ad-actions">{actions}</div>
    </form>
  );
}

export function AdminField({
  label,
  children,
  full,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "var(--ink)",
        width: "100%",
        gridColumn: full ? "1 / -1" : undefined,
        minWidth: 0,
      }}
    >
      <span style={{ display: "block" }}>{label}</span>
      <div style={{ width: "100%", minWidth: 0 }}>{children}</div>
    </label>
  );
}

export const adminInputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  color: "var(--ink)",
  background: "#faf8fd",
  border: "1px solid #d8d0e6",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 14,
  fontWeight: 500,
  minHeight: 44,
};
