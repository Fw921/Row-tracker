import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(15,23,31,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 max-w-xl text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
const buttonSizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-4 py-2", lg: "px-5 py-2.5 text-base" };
const buttonVariants = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "border border-border bg-surface text-foreground hover:bg-background",
  ghost: "text-muted hover:text-foreground hover:bg-surface",
  danger: "text-positive hover:bg-positive/10",
};

type ButtonProps = {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
  children: ReactNode;
} & (
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">)
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const cls = clsx(buttonBase, buttonSizes[size], buttonVariants[variant], className);
  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as { href: string };
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "highlight" | "faster" | "slower";
  className?: string;
}) {
  const tones = {
    neutral: "border-border text-muted",
    accent: "border-accent/30 bg-accent-soft text-accent",
    highlight: "border-highlight/30 bg-highlight-soft text-highlight",
    // Named for erg pacing, not good/bad: negative split = faster finish.
    faster: "border-negative/30 bg-negative/10 text-negative",
    slower: "border-positive/30 bg-positive/10 text-positive",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      {icon && <div className="mb-3 text-3xl">{icon}</div>}
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Deterministic color for an avatar-style initial badge, keyed off a name
 * so the same person always gets the same color across the app. */
const AVATAR_HUES = [210, 160, 20, 280, 340, 40, 190];
export function initialsAvatarStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const hue = AVATAR_HUES[hash % AVATAR_HUES.length];
  return { backgroundColor: `hsl(${hue} 70% 94%)`, color: `hsl(${hue} 55% 32%)` };
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={clsx(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
        className,
      )}
      style={initialsAvatarStyle(name)}
    >
      {initials || "?"}
    </span>
  );
}
