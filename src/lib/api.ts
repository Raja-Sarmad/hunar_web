const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function mediaUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "provider" | "admin";
  createdAt?: string;
};

export type ApiListing = {
  id: string;
  title: string;
  name: string;
  city: string;
  cat: number;
  price: number;
  image: number;
  imageUrl?: string;
  desc: string;
  rating: string;
  phone?: string;
  status?: "pending" | "approved" | "rejected";
  providerId?: string;
  createdAt?: string;
};

export type ApiCategory = {
  id: string;
  index: number;
  name: string;
  tone: string;
  icon: string;
  imageUrl?: string;
};

export type ApiBooking = {
  id: string;
  listingId: string;
  serviceTitle: string;
  providerId: string;
  providerName: string;
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  note: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  createdAt?: string;
};

const TOKEN_KEY = "hunar_token";
const USER_KEY = "hunar_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): ApiUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as ApiUser) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string | null, user: ApiUser | null) {
  if (typeof window === "undefined") return;
  if (!token || !user) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isForm) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export const UploadsAPI = {
  image: (file: File) => {
    const body = new FormData();
    body.append("image", file);
    return api<{ imageUrl: string; message: string }>("/uploads", {
      method: "POST",
      body,
    });
  },
};

export const CategoriesAPI = {
  list: () => api<{ categories: ApiCategory[] }>("/categories"),
  update: (id: string, body: { imageUrl?: string; name?: string }) =>
    api<{ category: ApiCategory; message: string }>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export const AuthAPI = {
  signup: (body: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: "user" | "provider";
  }) =>
    api<{ token: string; user: ApiUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    api<{ token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: () => api<{ user: ApiUser }>("/auth/me"),
  updateMe: (body: { name?: string; phone?: string }) =>
    api<{ user: ApiUser }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export const ListingsAPI = {
  public: (params?: { city?: string; cat?: number; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.city) qs.set("city", params.city);
    if (params?.cat !== undefined && params.cat >= 0) {
      qs.set("cat", String(params.cat));
    }
    if (params?.q) qs.set("q", params.q);
    const q = qs.toString();
    return api<{ listings: ApiListing[] }>(
      `/listings${q ? `?${q}` : ""}`,
    );
  },
  mine: () => api<{ listings: ApiListing[] }>("/listings?mine=1"),
  allForAdmin: () =>
    api<{ listings: ApiListing[] }>("/listings?status=all"),
  create: (body: Record<string, unknown>) =>
    api<{ listing: ApiListing; message: string }>("/listings", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  setStatus: (id: string, status: string) =>
    api<{ listing: ApiListing }>(`/listings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  remove: (id: string) =>
    api<{ ok: boolean }>(`/listings/${id}`, { method: "DELETE" }),
};

export const BookingsAPI = {
  list: () => api<{ bookings: ApiBooking[] }>("/bookings"),
  create: (body: Record<string, unknown>) =>
    api<{ booking: ApiBooking; message: string }>("/bookings", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  setStatus: (id: string, status: string) =>
    api<{ booking: ApiBooking }>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export const AdminAPI = {
  stats: () =>
    api<{
      pending: number;
      approved: number;
      bookings: number;
      users: number;
      requested: number;
    }>("/admin/stats"),
  users: () => api<{ users: ApiUser[] }>("/admin/users"),
  createUser: (body: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: "user" | "provider";
  }) =>
    api<{ user: ApiUser; message: string }>("/admin/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  setRole: (id: string, role: "user" | "provider") =>
    api<{ user: ApiUser }>(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  deleteUser: (id: string) =>
    api<{ ok: boolean }>(`/admin/users/${id}`, { method: "DELETE" }),
};
