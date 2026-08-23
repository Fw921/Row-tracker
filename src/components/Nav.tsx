import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/log", label: "Log Workout" },
  { href: "/import", label: "Import CSV" },
  { href: "/history", label: "History" },
];

export function Nav() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          🚣 Row Tracker
        </Link>
        <nav className="flex gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-background hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
