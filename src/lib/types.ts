export type Role = "user" | "provider" | "admin";

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
};

export type ListingStatus = "pending" | "approved" | "rejected";

export type BookingStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "cancelled";

export type Listing = {
  id: string;
  title: string;
  providerName: string;
  providerEmail: string;
  phone: string;
  city: string;
  cat: number;
  price: number;
  desc: string;
  status: ListingStatus;
  createdAt: string;
};

export type Booking = {
  id: string;
  serviceTitle: string;
  providerName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  note: string;
  status: BookingStatus;
  createdAt: string;
};
