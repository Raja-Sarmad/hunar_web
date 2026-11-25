"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CakeSlice,
  ChevronDown,
  CircleCheck,
  CookingPot,
  Flower,
  HandHeart,
  Heart,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Palette,
  Plus,
  RotateCcw,
  Scissors,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import ImagePicker from "@/components/image-picker";
import { BookingsAPI, ListingsAPI, mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  CATEGORY_META,
  CITIES,
  formatPrice,
  type CategoryInfo,
  type Service,
} from "@/lib/data";

const ICONS: LucideIcon[] = [
  Scissors,
  CookingPot,
  CakeSlice,
  BookOpen,
  Palette,
  Sparkles,
];

type ModalMode = "how" | "saved" | "service" | "book" | "offer" | "";

const MODAL_TITLES: Record<Exclude<ModalMode, "" | "service">, string> = {
  saved: "Saved services",
  how: "How HUNAR works",
  offer: "Offer a service",
  book: "Request a booking",
};

function SuccessNotice({
  message,
  close,
}: {
  message: string;
  close: () => void;
}) {
  return (
    <div className="stack" role="status">
      <p className="demo">
        <CircleCheck size={16} aria-hidden="true" /> {message}
      </p>
      <button className="primary" onClick={close} type="button">
        Back to the marketplace
      </button>
    </div>
  );
}

function BookingForm({
  service,
  close,
}: {
  service: Service;
  close: () => void;
}) {
  const { user } = useAuth();
  const [okMessage, setOkMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const min = new Date();
  min.setMinutes(min.getMinutes() - min.getTimezoneOffset());
  const minDate = min.toISOString().slice(0, 10);

  if (okMessage) return <SuccessNotice message={okMessage} close={close} />;

  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError("");
        const fd = new FormData(e.currentTarget);
        try {
          const res = await BookingsAPI.create({
            listingId: String(service.id),
            name: String(fd.get("name") || ""),
            phone: String(fd.get("phone") || ""),
            date: String(fd.get("date") || ""),
            note: String(fd.get("note") || ""),
            email: user?.email || "",
          });
          setOkMessage(res.message);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not send booking. Is the backend running?",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <p>
        {service.title} · {service.name} · From {formatPrice(service.price)}
      </p>
      <label>
        Your name
        <input
          name="name"
          required
          maxLength={60}
          autoComplete="name"
          defaultValue={user?.name || ""}
        />
      </label>
      <label>
        Phone number
        <input
          name="phone"
          type="tel"
          required
          maxLength={20}
          placeholder="03xx xxxxxxx"
          autoComplete="tel"
          defaultValue={user?.phone || ""}
        />
      </label>
      <label>
        Preferred date
        <input type="date" name="date" required min={minDate} />
      </label>
      <label>
        Booking details
        <textarea
          name="note"
          placeholder="Describe what you need."
          maxLength={600}
          required
        />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button className="primary" disabled={pending}>
        {pending ? "Sending…" : "Send booking request"}
      </button>
    </form>
  );
}

function OfferForm({ close }: { close: () => void }) {
  const { user } = useAuth();
  const [okMessage, setOkMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  if (okMessage) return <SuccessNotice message={okMessage} close={close} />;

  if (!user || user.role !== "provider") {
    return (
      <div className="stack">
        <p>
          Sign in as a service provider to submit a listing for admin review.
        </p>
        <a className="primary" href="/login?role=provider&next=/provider/offer">
          Sign in as provider
        </a>
        <a className="minor" href="/signup">
          Create provider account
        </a>
      </div>
    );
  }

  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError("");
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
          setOkMessage(res.message);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Could not submit listing.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <label>
        Display name
        <input
          name="name"
          required
          maxLength={45}
          placeholder="Your studio name"
          defaultValue={user.name}
          disabled
        />
      </label>
      <label>
        Phone number
        <input
          name="phone"
          type="tel"
          required
          maxLength={20}
          placeholder="03xx xxxxxxx"
          autoComplete="tel"
          defaultValue={user.phone || ""}
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
      <ImagePicker value={imageUrl} onChange={setImageUrl} />
      <label>
        About this service
        <textarea name="desc" maxLength={600} required />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button className="primary" disabled={pending}>
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}

function Modal({
  mode,
  open,
  close,
  picked,
  detail,
  saved,
  services,
}: {
  mode: Exclude<ModalMode, "">;
  open: (m: ModalMode) => void;
  close: () => void;
  picked: Service | null;
  detail: (s: Service) => void;
  saved: Array<string | number>;
  services: Service[];
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      el?.close();
    };
  }, []);

  const title =
    mode === "service" && picked
      ? picked.title
      : MODAL_TITLES[mode as Exclude<ModalMode, "" | "service">];

  return (
    <dialog
      ref={ref}
      aria-labelledby="modalTitle"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="dialogInner">
        <div className="dialogHeader">
          <span className="eyebrow">HUNAR / MARKETPLACE</span>
          <button
            className="iconBtn"
            aria-label="Close dialog"
            onClick={close}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <h2 id="modalTitle">{title}</h2>

        {mode === "how" ? (
          <>
            <p>
              HUNAR connects home-based women in Pakistan with people looking
              for local skills.
            </p>
            {(
              [
                [
                  "Explore a skill",
                  "Search for a service, choose a city, or browse a category.",
                ],
                [
                  "Request a booking",
                  "Open a service, choose a date, describe what you need and share a contact number.",
                ],
                [
                  "Get in touch",
                  "The provider receives your request and contacts you directly to confirm details and pricing.",
                ],
              ] as const
            ).map(([heading, copy], i) => (
              <section className="step" key={heading}>
                <b>0{i + 1}</b>
                <div>
                  <h3>{heading}</h3>
                  <p>{copy}</p>
                </div>
              </section>
            ))}
            <p className="demo">
              Providers can list their skills using “Offer a service”. Every
              listing is reviewed before it is published.
            </p>
            <button className="primary" onClick={close} type="button">
              Explore the marketplace <ArrowRight size={16} />
            </button>
          </>
        ) : null}

        {mode === "saved" ? (
          saved.length ? (
            services
              .filter((s) => saved.includes(s.id))
              .map((s) => (
                <button
                  key={s.id}
                  className="listLink"
                  type="button"
                  onClick={() => detail(s)}
                >
                  {s.title}
                  <ArrowRight size={16} />
                </button>
              ))
          ) : (
            <p>Tap the heart on a service to keep it here while you browse.</p>
          )
        ) : null}

        {mode === "service" && picked ? (
          <>
            <div
              className={`detailPhoto serviceImg img${picked.image}`}
              style={
                picked.imageUrl
                  ? {
                      backgroundImage: `url(${mediaUrl(picked.imageUrl)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            />
            <div className="detailLine">
              <span>
                {picked.name} · {picked.city}
              </span>
              <strong>{formatPrice(picked.price)}</strong>
            </div>
            <p>{picked.desc}</p>
            <button
              className="primary"
              type="button"
              onClick={() => open("book")}
            >
              Request a booking <ArrowRight size={16} />
            </button>
          </>
        ) : null}

        {mode === "book" && picked ? (
          <BookingForm service={picked} close={close} />
        ) : null}

        {mode === "offer" ? <OfferForm close={close} /> : null}
      </div>
    </dialog>
  );
}

export default function Marketplace({
  services,
  categories = CATEGORY_META.map((c, index) => ({
    index,
    name: c.name,
    tone: c.tone,
    icon: c.icon,
  })),
}: {
  services: Service[];
  categories?: CategoryInfo[];
}) {
  const { user, logout } = useAuth();
  const categoryList =
    categories.length > 0
      ? categories
      : CATEGORY_META.map((c, index) => ({
          index,
          name: c.name,
          tone: c.tone,
          icon: c.icon,
        }));
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [cat, setCat] = useState(-1);
  const [activeQuery, setActiveQuery] = useState("");
  const [activeCity, setActiveCity] = useState("");
  const [saved, setSaved] = useState<Array<string | number>>([]);
  const [modal, setModal] = useState<ModalMode>("");
  const [picked, setPicked] = useState<Service | null>(services[0] ?? null);
  const [exploring, setExploring] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">(
    "featured",
  );

  const accountHref =
    user?.role === "admin"
      ? "/admin/overview"
      : user?.role === "provider"
        ? "/provider"
        : user
          ? "/dashboard"
          : "/login";

  const explore = (q = "", c = "", category = -1) => {
    setActiveQuery(q);
    setActiveCity(c);
    setCat(category);
    setQuery(q);
    setCity(c);
    setExploring(true);
    setNavOpen(false);
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  const resetFilters = () => {
    setQuery("");
    setCity("");
    setCat(-1);
    setActiveQuery("");
    setActiveCity("");
    setSort("featured");
    setExploring(false);
    setNavOpen(false);
  };

  const openModal = (m: ModalMode) => {
    setModal(m);
    setNavOpen(false);
  };

  const filtered = services
    .filter(
      (s) =>
        (cat < 0 || s.cat === cat) &&
        (!activeCity || s.city === activeCity) &&
        `${s.title} ${s.name} ${categoryList[s.cat]?.name ?? CATEGORY_META[s.cat]?.name ?? ""} ${s.desc}`
          .toLowerCase()
          .includes(activeQuery.toLowerCase()),
    )
    .slice()
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0;
    });

  const hasFilters =
    exploring || cat >= 0 || !!activeCity || !!activeQuery || sort !== "featured";

  const openDetail = (s: Service) => {
    setPicked(s);
    openModal("service");
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    explore(query.trim(), city);
  };

  const toggleSave = (id: string | number) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const SpotlightIcon = ICONS[0];

  return (
    <>
      <header>
        <div className="topbar wrap">
          <a href="#" className="brand" aria-label="Hunar home">
            <Flower />
            HUNAR
          </a>
          <nav
            aria-label="Main navigation"
            className={navOpen ? "nav opened" : "nav"}
          >
            <button type="button" onClick={() => explore()}>
              <Search size={15} /> Explore
            </button>
            <button type="button" onClick={() => openModal("how")}>
              <Sparkles size={15} /> How it works
            </button>
            <button type="button" onClick={() => openModal("offer")}>
              <Store size={15} /> For providers
            </button>
            <a href={accountHref} onClick={() => setNavOpen(false)}>
              <UserRound size={15} /> {user ? "My account" : "Account"}
            </a>
          </nav>
          <div className="tools">
            <button
              className="saved"
              type="button"
              onClick={() => openModal("saved")}
            >
              <Heart size={17} /> Saved
              {saved.length > 0 ? ` (${saved.length})` : ""}
            </button>
            <a className="saved" href={accountHref} aria-label="Account">
              <UserRound size={17} />
              {user ? user.name.split(" ")[0] : "Account"}
            </a>
            {user ? (
              <button
                className="saved"
                type="button"
                onClick={() => {
                  logout();
                  setNavOpen(false);
                }}
              >
                <LogOut size={16} /> Sign out
              </button>
            ) : null}
            <span className="divider" />
            <button
              className="primary"
              type="button"
              onClick={() => openModal("offer")}
            >
              <Plus size={16} /> Offer a service
            </button>
            <button
              className="mobileMenu"
              aria-label="Toggle navigation"
              type="button"
              onClick={() => setNavOpen((v) => !v)}
            >
              {navOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div
            className="heroPhoto"
            role="img"
            aria-label="Pakistani artisan stitching lavender fabric at her home sewing machine"
          />
          <div className="wrap heroInner">
            <div className="heroCopy">
              <span className="eyebrow heroBadge">
                <span /> WOMEN-LED MARKETPLACE
              </span>
              <h1>
                Local skills.
                <br />
                <em>Limitless possibilities.</em>
              </h1>
              <p>
                Discover and book talented home-based women
                <br className="desktop" /> in your community, across Pakistan.
              </p>
              <form className="searchBox" onSubmit={onSearch}>
                <Search size={19} />
                <input
                  aria-label="Search skills or services"
                  placeholder="What service do you need?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="city">
                  <MapPin size={16} />
                  <select
                    aria-label="Select city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="">All cities</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} />
                </div>
                <button className="primary" type="submit">
                  <Search size={15} /> Search
                </button>
              </form>
              <div className="trust">
                <span>
                  <ShieldCheck /> Reviewed listings
                </span>
                <span>
                  <MapPin /> Local connections
                </span>
                <span>
                  <Heart /> Women-led
                </span>
              </div>
            </div>
          </div>
          <div className="photoTag">
            <span className="photoIcon">
              <SpotlightIcon size={22} />
            </span>
            <div>
              <small>MAKER SPOTLIGHT</small>
              <strong>Ayesha’s Stitch Studio</strong>
              <span>
                <MapPin size={12} /> Lahore, Pakistan
              </span>
            </div>
          </div>
        </section>

        <section id="categories" className="wrap categorySec">
          <div className="sectionHead">
            <div>
              <div className="eyebrow">
                <LayoutGrid size={12} /> EXPLORE THE MARKETPLACE
              </div>
              <h2>Browse by category</h2>
            </div>
            <button className="textBtn" type="button" onClick={() => explore()}>
              View all services <ArrowRight />
            </button>
          </div>
          <div className="categoryGrid">
            {categoryList.map((item) => {
              const i = item.index;
              const Icon = ICONS[i] || Sparkles;
              const photo = item.imageUrl ? mediaUrl(item.imageUrl) : "";
              return (
                <button
                  key={item.name}
                  className={`category ${cat === i ? "selected" : ""} ${photo ? "categoryHasPhoto" : ""}`}
                  type="button"
                  onClick={() => explore(activeQuery, activeCity, i)}
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="categoryPhoto" />
                  ) : (
                    <span className={`iconTile ${item.tone}`}>
                      <Icon />
                    </span>
                  )}
                  {item.name}
                </button>
              );
            })}
          </div>
        </section>

        <section id="services" className="services">
          <div className="wrap">
            <div className="sectionHead">
              <div>
                <div className="eyebrow">
                  <SlidersHorizontal size={12} />{" "}
                  {hasFilters ? "FILTERED RESULTS" : "THE COMMUNITY EDIT"}
                </div>
                <h2>
                  {cat >= 0
                    ? categoryList[cat]?.name || CATEGORY_META[cat]?.name
                    : hasFilters
                      ? "Browse services"
                      : "Featured services"}
                </h2>
                <p>
                  {hasFilters
                    ? `${filtered.length} matching service${
                        filtered.length === 1 ? "" : "s"
                      }${activeCity ? ` in ${activeCity}` : ""}${
                        activeQuery ? ` for “${activeQuery}”` : ""
                      }`
                    : "Discover the skills and stories behind local favourites."}
                </p>
              </div>
              <button
                className="textBtn"
                type="button"
                onClick={() => (hasFilters ? resetFilters() : explore())}
              >
                {hasFilters ? (
                  <>
                    <RotateCcw size={14} /> Reset filters
                  </>
                ) : (
                  <>
                    Explore all <ArrowRight />
                  </>
                )}
              </button>
            </div>

            <div className="mk-filters" aria-label="Service filters">
              <label className="mk-grow">
                <span>
                  <Search size={15} /> Search
                </span>
                <input
                  value={query}
                  placeholder="Skill, provider…"
                  onChange={(e) => {
                    const v = e.target.value;
                    setQuery(v);
                    setActiveQuery(v.trim());
                    setExploring(true);
                  }}
                />
              </label>
              <label>
                <span>
                  <MapPin size={15} /> City
                </span>
                <select
                  value={city}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCity(v);
                    setActiveCity(v);
                    setExploring(true);
                  }}
                >
                  <option value="">All cities</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  <LayoutGrid size={15} /> Category
                </span>
                <select
                  value={cat}
                  onChange={(e) => {
                    setCat(Number(e.target.value));
                    setExploring(true);
                  }}
                >
                  <option value={-1}>All categories</option>
                  {categoryList.map((item) => (
                    <option key={item.name} value={item.index}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  <SlidersHorizontal size={15} /> Sort
                </span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(
                      e.target.value as "featured" | "price-asc" | "price-desc",
                    );
                    setExploring(true);
                  }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </label>
              {hasFilters ? (
                <button className="ad-btn" type="button" onClick={resetFilters}>
                  <RotateCcw size={14} /> Clear
                </button>
              ) : null}
            </div>

            <div className="mk-chipRow" aria-label="Quick category filters">
              <button
                type="button"
                className={`mk-chip ${cat < 0 ? "active" : ""}`}
                onClick={() => {
                  setCat(-1);
                  setExploring(true);
                }}
              >
                <LayoutGrid size={13} /> All
              </button>
              {categoryList.map((item) => {
                const Icon = ICONS[item.index] || Sparkles;
                return (
                  <button
                    key={item.name}
                    type="button"
                    className={`mk-chip ${cat === item.index ? "active" : ""}`}
                    onClick={() => explore(activeQuery, activeCity, item.index)}
                  >
                    <Icon size={13} /> {item.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>

            <div className="serviceGrid">
              {(hasFilters ? filtered : filtered.slice(0, 4)).map((s) => {
                const CatIcon = ICONS[s.cat] || Sparkles;
                const photo = s.imageUrl ? mediaUrl(s.imageUrl) : "";
                return (
                  <article className="serviceCard" key={s.id}>
                    <div
                      className={`serviceImg img${s.image}`}
                      style={
                        photo
                          ? {
                              backgroundImage: `url(${photo})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    >
                      <button
                        className="photoLink"
                        aria-label={`View ${s.title}`}
                        type="button"
                        onClick={() => openDetail(s)}
                      />
                      <span className="imageLabel">
                        <CatIcon size={12} />{" "}
                        {categoryList[s.cat]?.name ||
                          CATEGORY_META[s.cat]?.name}
                      </span>
                      <button
                        aria-pressed={saved.includes(s.id)}
                        className="heart"
                        aria-label={`Save ${s.title}`}
                        type="button"
                        onClick={() => toggleSave(s.id)}
                      >
                        <Heart
                          size={16}
                          fill={saved.includes(s.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <div className="cardBody">
                      <small>
                        <MapPin size={13} />
                        {s.city}
                      </small>
                      <button
                        className="cardTitle"
                        type="button"
                        onClick={() => openDetail(s)}
                      >
                        {s.title}
                      </button>
                      <span className="providerName">
                        {s.name} <BadgeCheck size={14} />
                      </span>
                      <div className="cardFoot">
                        <span>
                          From <b>{formatPrice(s.price)}</b>
                        </span>
                        <span>
                          <Star size={14} />
                          {s.rating}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {!filtered.length ? (
              <div className="empty">
                No services match these filters.{" "}
                <button
                  className="textBtn"
                  type="button"
                  onClick={resetFilters}
                >
                  <RotateCcw size={14} /> Clear filters
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="wrap join">
          <HandHeart />
          <div>
            <div className="eyebrow">
              <HandHeart size={12} /> FOR HOME-BASED WOMEN
            </div>
            <h2>Your skill belongs here.</h2>
            <p>Turn what you love doing into a service for your community.</p>
          </div>
          <button
            className="primary"
            type="button"
            onClick={() => openModal("offer")}
          >
            <Plus size={16} /> Offer a service
          </button>
        </section>
      </main>

      {modal ? (
        <Modal
          key={modal}
          mode={modal}
          open={openModal}
          close={() => setModal("")}
          picked={picked}
          detail={openDetail}
          saved={saved}
          services={services}
        />
      ) : null}
    </>
  );
}
