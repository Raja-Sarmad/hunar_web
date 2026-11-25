import type { ReactNode } from "react";
import Link from "next/link";
import {
  BookOpen,
  CakeSlice,
  CookingPot,
  Flower,
  HandHeart,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  MapPin,
  Package,
  Palette,
  Scissors,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Store,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

function FooterLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="site-footerLink">
      <span className="site-footerLinkIcon" aria-hidden>
        <Icon size={15} strokeWidth={2.1} />
      </span>
      <span>{children}</span>
    </Link>
  );
}

function FooterCol({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="site-footerCol">
      <h3>
        <span className="site-footerColIcon" aria-hidden>
          <Icon size={14} strokeWidth={2.2} />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

const SKILLS: { icon: LucideIcon; label: string; tone: string }[] = [
  { icon: Scissors, label: "Stitching", tone: "violet" },
  { icon: CookingPot, label: "Cooking", tone: "peach" },
  { icon: CakeSlice, label: "Baking", tone: "pink" },
  { icon: BookOpen, label: "Tutoring", tone: "mint" },
  { icon: Palette, label: "Crafts", tone: "yellow" },
  { icon: Sparkles, label: "Beauty", tone: "blue" },
];

export default function SiteFooter() {
  // Static year avoids Next.js prerender error with `new Date()`
  const year = 2026;

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="wrap site-footerWrap">
        <div className="site-footerSkills" aria-label="Skill categories">
          {SKILLS.map(({ icon: Icon, label, tone }) => (
            <Link key={label} href="/#categories" className="site-footerSkill">
              <span className={`iconTile ${tone}`} aria-hidden>
                <Icon size={18} />
              </span>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="site-footerGrid">
          <div className="site-footerBrandBlock">
            <Link href="/" className="brand site-footerBrand">
              <Flower />
              HUNAR
            </Link>
            <p>
              Built for home-based women across Pakistan — stitching, cooking,
              baking, tutoring and creative care in one place.
            </p>
            <div className="site-footerChips">
              <span>
                <MapPin size={14} /> Across Pakistan
              </span>
              <span>
                <ShieldCheck size={14} /> Verified providers
              </span>
              <span>
                <Users size={14} /> Community first
              </span>
            </div>
          </div>

          <FooterCol title="Explore" icon={LayoutGrid}>
            <FooterLink href="/#services" icon={Search}>
              Browse services
            </FooterLink>
            <FooterLink href="/#categories" icon={LayoutGrid}>
              Categories
            </FooterLink>
            <FooterLink href="/signup" icon={HandHeart}>
              Offer a skill
            </FooterLink>
          </FooterCol>

          <FooterCol title="Account" icon={UserPlus}>
            <FooterLink href="/login" icon={LogIn}>
              Sign in
            </FooterLink>
            <FooterLink href="/signup" icon={UserPlus}>
              Create account
            </FooterLink>
            <FooterLink href="/dashboard" icon={LayoutDashboard}>
              My dashboard
            </FooterLink>
          </FooterCol>

          <FooterCol title="Workspace" icon={Store}>
            <FooterLink href="/admin" icon={Shield}>
              Admin panel
            </FooterLink>
            <FooterLink href="/admin/listings" icon={Package}>
              Manage listings
            </FooterLink>
            <FooterLink href="/provider" icon={Store}>
              Provider studio
            </FooterLink>
          </FooterCol>
        </div>

        <div className="site-footerBottom">
          <span>© {year} HUNAR · Women-led local skills</span>
          <span className="site-footerBottomMark">
            <Flower size={14} /> Crafted for Pakistan
          </span>
        </div>
      </div>
    </footer>
  );
}
