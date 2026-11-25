"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import DashboardShell from "@/components/dashboard-shell";
import ImagePicker from "@/components/image-picker";
import { CATEGORY_META, CITIES } from "@/lib/data";
import { ListingsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ProviderOfferPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    setPhone(user?.phone || "");
  }, [user]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const fd = new FormData(e.currentTarget);
    try {
      const cat = Number(fd.get("cat") || 0);
      const res = await ListingsAPI.create({
        title: String(fd.get("title") || ""),
        phone: String(fd.get("phone") || ""),
        desc: String(fd.get("desc") || ""),
        city: String(fd.get("city") || ""),
        cat,
        price: Number(fd.get("price") || 0),
        image: cat,
        imageUrl,
      });
      setMessage(res.message);
      window.setTimeout(() => router.push("/provider/listings"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <DashboardShell
      requireRole="provider"
      title="Offer a service"
      subtitle="Add a photo of your work, then submit for admin review before it goes live."
      nav={[
        { href: "/provider", label: "Overview" },
        { href: "/provider/listings", label: "Listings" },
        { href: "/provider/bookings", label: "Orders" },
        { href: "/provider/offer", label: "Offer a service" },
      ]}
    >
      <form className="ad-form" style={{ maxWidth: 560 }} onSubmit={onSubmit}>
        <label>
          Display name
          <input value={user?.name || ""} disabled />
        </label>
        <label>
          Phone number
          <input
            name="phone"
            type="tel"
            required
            maxLength={20}
            placeholder="03xx xxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label>
          Service title
          <input name="title" required maxLength={70} />
        </label>
        <label>
          Category
          <select name="cat" defaultValue={0}>
            {CATEGORY_META.map((cat, i) => (
              <option key={cat.name} value={i}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          City
          <select name="city" defaultValue={CITIES[0]}>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label>
          Starting price (PKR)
          <input type="number" name="price" min={1} max={1000000} required />
        </label>

        <ImagePicker
          label="Service image"
          value={imageUrl}
          onChange={setImageUrl}
          hint="Show your work clearly — customers love real photos."
        />

        <label>
          About this service
          <textarea name="desc" maxLength={600} required rows={4} />
        </label>
        {error ? <p className="ad-error">{error}</p> : null}
        {message ? <p className="demo">{message}</p> : null}
        <button className="primary" type="submit" disabled={pending}>
          {pending ? (
            "Submitting…"
          ) : (
            <>
              <ImagePlus size={16} style={{ marginRight: 6 }} />
              Submit for review
            </>
          )}
        </button>
      </form>
    </DashboardShell>
  );
}
