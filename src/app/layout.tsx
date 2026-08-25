import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// One font family for the whole app -- Manrope's variable weight range
// (200-800) covers body copy and display headings both, so there's no need
// for a second display-only font the way Space Grotesk was paired with
// Inter before.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Row Tracker",
  description: "Rowing performance analytics: log erg pieces, track improvement, predict 2k time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        {/* Sky/water atmosphere behind every route — see the comment on
         * .app-atmosphere in globals.css. No route check needed: "/",
         * "/login", "/signup" already paint a full-bleed, opaque hero over
         * this exact spot, so it's simply hidden there rather than
         * needing to be conditionally skipped. */}
        <div aria-hidden className="app-atmosphere pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px]" />
        <Nav />
        {/* No max-w cap here on purpose: Nav is now a sidebar column, not a
         * top bar, so this is the other flex-row column and should fill
         * whatever width remains. A page that wants a narrower reading
         * width (a form, a detail view) sets that itself, same as before. */}
        <main className="min-w-0 flex-1 px-6 py-8 sm:px-8 lg:px-10">{children}</main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
