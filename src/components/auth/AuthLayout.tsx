import type { ReactNode } from "react";

/**
 * Full-bleed split-screen shell for /login, /signup, /forgot-password.
 * Breaks out of the root layout's `max-w-6xl` *centered* container (see
 * src/app/layout.tsx), since these are pre-login entry screens, not part
 * of the app shell — Nav.tsx hides itself on these routes for the same
 * reason.
 *
 * A same-magnitude negative margin only cancels the parent's own padding —
 * it can't escape the parent's max-width/mx-auto box itself, so on any
 * viewport wider than 1152px (max-w-6xl) that leaves the centering gutter
 * showing on both sides instead of a true full-bleed edge. `w-screen` +
 * `left-1/2` + `-translate-x-1/2` is viewport-relative instead, so it
 * always reaches both edges regardless of the ancestor's width.
 */
export function AuthLayout({
  children,
  showcase,
}: {
  children: ReactNode;
  showcase?: ReactNode;
}) {
  return (
    <div className="relative left-1/2 -my-6 min-h-screen w-screen -translate-x-1/2 sm:-my-8 lg:flex">
      <div className="flex min-h-screen flex-1 items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
          {children}
        </div>
      </div>
      {showcase && <div className="hidden lg:flex lg:w-[46%] lg:shrink-0">{showcase}</div>}
    </div>
  );
}
