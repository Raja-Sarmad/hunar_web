import type { Booking, Listing, UserAccount } from "@/lib/types";

const USERS_KEY = "hunar_users";
const SESSION_KEY = "hunar_session";
const LISTINGS_KEY = "hunar_listings";
const BOOKINGS_KEY = "hunar_bookings";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedIfNeeded() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(USERS_KEY)) {
    const users: UserAccount[] = [
      {
        id: "admin-1",
        name: "HUNAR Admin",
        email: "admin@hunar.pk",
        role: "admin",
      },
      {
        id: "user-1",
        name: "Fatima Raza",
        email: "fatima@example.com",
        phone: "03001234567",
        role: "user",
      },
      {
        id: "prov-1",
        name: "Ayesha Khan",
        email: "ayesha@example.com",
        phone: "03007654321",
        role: "provider",
      },
    ];
    write(USERS_KEY, users);
  }
  if (!localStorage.getItem(LISTINGS_KEY)) {
    const listings: Listing[] = [
      {
        id: "list-1",
        title: "Hand-embroidered suits",
        providerName: "Ayesha Khan",
        providerEmail: "ayesha@example.com",
        phone: "03007654321",
        city: "Lahore",
        cat: 0,
        price: 2500,
        desc: "Personalised floral embroidery and custom stitching.",
        status: "approved",
        createdAt: new Date().toISOString(),
      },
      {
        id: "list-2",
        title: "Weekend baking box",
        providerName: "Ayesha Khan",
        providerEmail: "ayesha@example.com",
        phone: "03007654321",
        city: "Lahore",
        cat: 2,
        price: 1800,
        desc: "Fresh cookies and brownies for weekend gatherings.",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ];
    write(LISTINGS_KEY, listings);
  }
  if (!localStorage.getItem(BOOKINGS_KEY)) {
    const bookings: Booking[] = [
      {
        id: "book-1",
        serviceTitle: "Hand-embroidered suits",
        providerName: "Ayesha Khan",
        customerName: "Fatima Raza",
        customerPhone: "03001234567",
        customerEmail: "fatima@example.com",
        date: "2026-12-05",
        note: "Need embroidery on two lawn suits for Eid.",
        status: "requested",
        createdAt: new Date().toISOString(),
      },
    ];
    write(BOOKINGS_KEY, bookings);
  }
}

export function getSession(): UserAccount | null {
  seedIfNeeded();
  return read<UserAccount | null>(SESSION_KEY, null);
}

export function setSession(user: UserAccount | null) {
  if (!user) localStorage.removeItem(SESSION_KEY);
  else write(SESSION_KEY, user);
}

export function getUsers(): UserAccount[] {
  seedIfNeeded();
  return read<UserAccount[]>(USERS_KEY, []);
}

export function upsertUser(user: UserAccount) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.email === user.email);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  write(USERS_KEY, users);
}

export function loginDemo(email: string, role?: UserAccount["role"]) {
  seedIfNeeded();
  const users = getUsers();
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user && role) {
    user = {
      id: `u-${Date.now()}`,
      name: email.split("@")[0],
      email,
      role,
    };
    upsertUser(user);
  }
  if (!user) return null;
  setSession(user);
  return user;
}

export function getListings(): Listing[] {
  seedIfNeeded();
  return read<Listing[]>(LISTINGS_KEY, []);
}

export function saveListings(listings: Listing[]) {
  write(LISTINGS_KEY, listings);
}

export function getBookings(): Booking[] {
  seedIfNeeded();
  return read<Booking[]>(BOOKINGS_KEY, []);
}

export function saveBookings(bookings: Booking[]) {
  write(BOOKINGS_KEY, bookings);
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
