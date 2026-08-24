"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Trophy, ClipboardList, Ship, Upload, Plus, Sailboat, CircleUser } from "lucide-react";
import { Button } from "@/components/ui";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/team", label: "Team", icon: Trophy },
  { href: "/roster", label: "Roster", icon: ClipboardList },
  { href: "/boats", label: "Boats", icon: Ship },
  { href: "/import", label: "Import", icon: Upload },
];

// "/" is now the public welcome/landing page and the auth screens (see
// src/app/login, /signup, /forgot-password) are full-bleed and pre-login —
// showing the logged-in app's nav on top of any of them would both look
// wrong and imply a session that doesn't exist yet.
const NAV_HIDDEN_ROUTES = ["/", "/login", "/signup", "/forgot-password"];

export function Nav() {
  const pathname = usePathname();
  if (NAV_HIDDEN_ROUTES.includes(pathname)) return null;

  return (
    <aside className="sticky top-0 z-10 flex h-screen w-16 shrink-0 flex-col border-r border-border bg-surface sm:w-56">
      <Link
        href="/dashboard"
        className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-4 font-display font-semibold tracking-tight transition-transform duration-150 active:scale-[0.98] sm:px-5"
      >
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent text-accent-foreground"
        >
          <Sailboat className="h-4.5 w-4.5" aria-hidden />
        </span>
        <span className="hidden truncate sm:inline">Row Tracker</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3 text-sm sm:px-3">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              title={link.label}
              className={`flex items-center gap-3 border-l-2 px-2.5 py-2 transition-colors duration-150 active:scale-[0.98] sm:px-3 ${
                active
                  ? "border-accent bg-accent-soft font-medium text-accent-strong"
                  : "border-transparent text-muted hover:border-border-strong hover:bg-background hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden truncate sm:inline">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-border px-2 py-3 sm:px-3">
        <Link
          href="/profile"
          title="Profile"
          className="flex items-center gap-3 px-2.5 py-2 text-sm text-muted transition-colors duration-150 hover:bg-background hover:text-foreground sm:px-3"
        >
          <CircleUser className="h-4.5 w-4.5 shrink-0" aria-hidden />
          <span className="hidden truncate sm:inline">Profile</span>
        </Link>
        <Button href="/log" size="sm" className="w-full justify-center">
          <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Log</span>
        </Button>
      </div>
    </aside>
  );
}
