"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Trophy, ClipboardList, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/team", label: "Team", icon: Trophy },
  { href: "/roster", label: "Roster", icon: ClipboardList },
  { href: "/import", label: "Import", icon: Upload },
];

// Entry-point auth screens (see src/app/login, /signup, /forgot-password)
// are full-bleed and pre-login — showing the logged-in app's nav on top of
// them would both look wrong and imply a session that doesn't exist yet.
const NAV_HIDDEN_ROUTES = ["/login", "/signup", "/forgot-password"];

export function Nav() {
  const pathname = usePathname();
  if (NAV_HIDDEN_ROUTES.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display font-semibold tracking-tight">
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-base text-accent-foreground"
          >
            🚣
          </span>
          <span className="hidden sm:inline">Row Tracker</span>
        </Link>
        <nav className="flex flex-1 gap-1 overflow-x-auto text-sm">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors duration-150 sm:px-3 ${
                  active
                    ? "bg-accent-soft font-medium text-accent-strong"
                    : "text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <Button href="/log" size="sm" className="shrink-0">
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Log
        </Button>
      </div>
    </header>
  );
}
