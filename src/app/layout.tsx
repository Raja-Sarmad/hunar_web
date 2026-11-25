import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HUNAR | Local skills, limitless possibilities",
  description:
    "Discover local stitching, cooking, baking, tutoring and creative services from home-based women across Pakistan.",
};

export const viewport: Viewport = {
  themeColor: "#f6f3ff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full ${poppins.variable}`}>
      <body className={`${poppins.className} min-h-full flex flex-col`}>
        <AuthProvider>
          <div className="site-main">{children}</div>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
