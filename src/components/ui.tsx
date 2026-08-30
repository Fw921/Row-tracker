import clsx from "clsx";
import Link from "next/link";
import { AlertCircle, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { CountUpStat, type StatFormatKind } from "@/components/motion/CountUpStat";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
  /** No longer read — every card now gets the same tinted background,
   * colored border, and hover-lift (see --card-bg/--card-border in
   * globals.css), so there's nothing left to opt into. Kept in the type so
   * existing call sites that still pass this prop don't need touching. */
  interactive?: boolean;
}) {
  return (
    <div
      className={clsx(
        "border-2 border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-raised)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Same icon-in-a-colored-badge recipe as the landing page's feature
   * cards and StatTile — an easy, low-risk way to carry that page's visual
   * language into the app itself without touching how data pages read. */
  icon?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
            {icon}
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
            {title}
          </h1>
          {description && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">{description}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

// One press-scale value, reused by every clickable control in the app
// (buttons, icon buttons, chips) — see Reveal.tsx's comment on the same
// idea for scroll reveals: one consistent recipe, not a different feel
// per component.
const PRESS_SCALE = "active:scale-[0.97]";

const buttonBase =
  `inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${PRESS_SCALE} disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface`;
const buttonSizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-4 py-2", lg: "px-5 py-2.5 text-base" };
const buttonVariants = {
  primary: "bg-accent text-accent-foreground shadow-sm hover:bg-accent-strong",
  secondary: "border border-border bg-surface text-foreground hover:border-border-strong hover:bg-background",
  ghost: "text-muted hover:text-foreground hover:bg-background",
  danger: "text-positive hover:bg-positive/10",
  // Filled, for the affirmative action of a destructive confirm dialog —
  // "danger" alone reads as too light-weight next to a bordered Cancel.
  dangerSolid: "bg-positive text-white shadow-sm hover:bg-positive-strong",
};

/** The class string a Button of this variant/size renders — exported so
 * non-Button elements (e.g. Radix's asChild-composed AlertDialogAction)
 * can look identical without a second button styling system. */
export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
} = {}) {
  return clsx(buttonBase, buttonSizes[size], buttonVariants[variant], className);
}

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
  const cls = buttonClassName({ variant, size, className });
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

type IconButtonOwnProps = {
  className?: string;
  children: ReactNode;
  label: string;
  tone?: "muted" | "danger";
};

type IconButtonProps = IconButtonOwnProps &
  (
    | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  );

/** Small square button for a single icon action (remove, delete, …). Pass
 * `href` (same discriminated-union pattern as Button above) to render as a
 * Link instead of a button — e.g. a profile icon that navigates. */
export function IconButton({ className, children, label, tone = "muted", ...props }: IconButtonProps) {
  const cls = clsx(
    `inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-all duration-150 ${PRESS_SCALE} disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40`,
    tone === "danger" ? "text-muted hover:bg-positive/10 hover:text-positive" : "text-muted hover:bg-background hover:text-foreground",
    className,
  );
  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as { href: string };
    return (
      <Link href={href} aria-label={label} title={label} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button
      aria-label={label}
      title={label}
      className={cls}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
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
    accent: "border-accent/25 bg-accent-soft text-accent-strong",
    highlight: "border-highlight/30 bg-highlight-soft text-highlight-strong",
    // Named for erg pacing, not good/bad: negative split = faster finish.
    faster: "border-negative/30 bg-negative/10 text-negative",
    // text-positive-strong, not text-positive: positive on its own 10% tint
    // only measures 4.34:1, short of the 4.5:1 AA floor for body text.
    slower: "border-positive/30 bg-positive/10 text-positive-strong",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
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
    <div className="flex flex-col items-center justify-center border border-dashed border-border-strong bg-surface/60 px-6 py-14 text-center">
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
          {icon}
        </div>
      )}
      <p className="font-display font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Inline error/warning banner for form-level validation feedback. */
export function Alert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={clsx(
        "flex items-start gap-2 rounded-lg border border-positive/25 bg-positive/10 px-3 py-2.5 text-sm text-positive-strong",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

/** A row of StatTiles fused into one seamless block instead of separate
 * floating cards — a shared 1px "grout" line between every tile via a
 * background-color-under-a-gap-px trick (this container paints
 * --card-border behind everything; each tile paints over it with
 * --card-bg except for the gap-px sliver), so tiles read as one joined
 * strip no matter how the responsive column count wraps — no per-
 * breakpoint divider logic needed. Pass the grid's column classes (e.g.
 * "grid-cols-2 sm:grid-cols-4") via className; this always supplies its
 * own gap/border/background. */
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "grid gap-px overflow-hidden border-2 border-[var(--card-border)] bg-[var(--card-border)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A KPI-style tile: icon, label, and a big display-face number. The
 * number is deliberately the loudest thing in the tile — everything else
 * (icon, label, context) is sized and muted to stay out of its way.
 * Always meant to be composed inside a StatGrid, which supplies the
 * shared background/border/joined-grid look — rendering one on its own
 * would just show a plain unbordered block. */
export function StatTile({
  icon,
  label,
  value,
  numericValue,
  format,
  tone = "default",
  context,
}: {
  icon?: ReactNode;
  label: string;
  /** Always the display fallback — used as-is when there's no numericValue
   * (e.g. a "—" empty state), and as the pre-hydration/initial paint value
   * otherwise. */
  value: string;
  /** When set alongside `format`, the tile counts up to this number instead
   * of just rendering `value` — see CountUp.tsx. */
  numericValue?: number | null;
  /** A plain function from a Client Component caller (the charts, GoalsCard,
   * …), or a `StatFormatKind` string from a Server Component page
   * (workouts/[id], profile) — a Server Component can't hand CountUp a
   * function prop directly (React can only serialize plain data across that
   * boundary), so it passes a kind name instead and CountUpStat resolves it
   * to a real formatter from inside the client boundary. */
  format?: ((n: number) => string) | StatFormatKind;
  tone?: "default" | "highlight";
  /** A short, real comparison already computed by the caller — "Season
   * best", "+2.4s from PR" — never a placeholder. Omit entirely rather
   * than invent one when there's nothing genuine to say. */
  context?: ReactNode;
}) {
  return (
    <div className="bg-[var(--card-bg)] p-3.5 transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--accent)_6%,var(--card-bg))] sm:p-4">
      <div className="mb-2 flex items-center gap-1.5 text-muted">
        {icon && (
          <span
            className={clsx(
              "flex h-6 w-6 items-center justify-center rounded-md",
              tone === "highlight" ? "bg-highlight-soft text-highlight-strong" : "bg-accent-soft text-accent-strong",
            )}
          >
            {icon}
          </span>
        )}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="tabular font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {numericValue != null && format ? (
          typeof format === "string" ? (
            <CountUpStat value={numericValue} kind={format} />
          ) : (
            <CountUp value={numericValue} format={format} />
          )
        ) : (
          value
        )}
      </div>
      {context && <div className="mt-1 text-xs text-muted">{context}</div>}
    </div>
  );
}

/** Shared text/number/date/select input styling used across every form. */
export const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-soft focus:border-accent focus:ring-2 focus:ring-accent/15";

/** A native <select> with a custom chevron so it matches the text/date
 * inputs visually — still a real <select> underneath for accessibility and
 * mobile-native pickers, just with the browser's own arrow hidden. */
export function Select({
  className,
  children,
  ...props
}: { className?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={clsx(inputClass, "appearance-none pr-8", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-medium text-foreground">{label}</span>
        {/* text-muted, not text-muted-soft: muted-soft only clears 3:1 on
         * surface, short of the 4.5:1 AA floor for this size of body text. */}
        {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Small rounded chip button, e.g. distance presets. Pass `bare` when
 * rendering inside a `ChipGroup` (src/components/motion/ChipGroup.tsx) —
 * the group's own sliding pill provides the fill, so the chip itself only
 * needs a text-color state. `data-active` is what ChipGroup reads to find
 * which chip to slide the pill under. */
export function Chip({
  active,
  bare,
  className,
  ...props
}: { active?: boolean; bare?: boolean; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      data-active={active ? "true" : undefined}
      className={clsx(
        `relative z-[1] cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-150 ${PRESS_SCALE} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40`,
        bare
          ? active
            ? "border-transparent text-accent-strong"
            : "border-transparent text-muted hover:text-foreground"
          : active
            ? "border-accent bg-accent-soft text-accent-strong"
            : "border-border text-muted hover:border-border-strong hover:bg-background",
        className,
      )}
      {...props}
    />
  );
}

/** Pulsing placeholder block for loading.tsx skeletons. Pass a Tailwind
 * height/width via className, e.g. <Skeleton className="h-4 w-24" />. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-md bg-border/70", className)} aria-hidden />;
}

/** Skeleton for a PageHeader — title and description bars. */
export function PageHeaderSkeleton({
  withAction,
  withIcon,
}: {
  withAction?: boolean;
  /** Match the loaded PageHeader's `icon` badge so the skeleton doesn't
   * shift layout once real content replaces it — pass this on any page
   * whose PageHeader is given an `icon`. */
  withIcon?: boolean;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {withIcon && <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />}
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>
      {withAction && <Skeleton className="h-9 w-36 rounded-lg" />}
    </div>
  );
}

/** Skeleton for a row of StatTile-shaped cells — the same joined StatGrid
 * look as the real thing. */
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <StatGrid className="grid-cols-2 sm:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-[var(--card-bg)] p-3.5 sm:p-4">
          <Skeleton className="mb-2 h-5 w-5 rounded-md" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </StatGrid>
  );
}

/** Skeleton for a Card full of rows, e.g. a table or list about to load. */
export function CardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="divide-y divide-border overflow-hidden">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 flex-1 max-w-xs" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </Card>
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
