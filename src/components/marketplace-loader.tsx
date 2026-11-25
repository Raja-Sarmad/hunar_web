"use client";

import { useEffect, useState } from "react";
import Marketplace from "@/components/marketplace";
import {
  CategoriesAPI,
  ListingsAPI,
  type ApiListing,
} from "@/lib/api";
import {
  CATEGORY_META,
  SERVICES,
  type CategoryInfo,
  type Service,
} from "@/lib/data";

function toService(l: ApiListing): Service {
  return {
    id: l.id,
    title: l.title,
    name: l.name,
    city: l.city,
    cat: l.cat,
    price: l.price,
    image: l.image ?? 0,
    imageUrl: l.imageUrl || "",
    desc: l.desc,
    rating: l.rating || "New",
  };
}

const FALLBACK_CATEGORIES: CategoryInfo[] = CATEGORY_META.map((c, index) => ({
  index,
  name: c.name,
  tone: c.tone,
  icon: c.icon,
}));

export default function MarketplaceLoader() {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [categories, setCategories] =
    useState<CategoryInfo[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    const load = () => {
      ListingsAPI.public()
        .then((res) => {
          if (res.listings?.length) {
            setServices(res.listings.map(toService));
          }
        })
        .catch(() => {
          /* keep seed fallback if API offline */
        });

      CategoriesAPI.list()
        .then((res) => {
          if (res.categories?.length) {
            setCategories(
              res.categories.map((c) => ({
                id: c.id,
                index: c.index,
                name: c.name,
                tone: c.tone,
                icon: c.icon,
                imageUrl: c.imageUrl || "",
              })),
            );
          }
        })
        .catch(() => {
          /* keep static categories */
        });
    };
    load();
    const t = window.setInterval(load, 10000);
    return () => window.clearInterval(t);
  }, []);

  return <Marketplace services={services} categories={categories} />;
}
