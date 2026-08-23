import type { ReactNode } from "react";

/**
 * Full-bleed split-screen shell for /login, /signup, /forgot-password.
 * Breaks out of the root layout's `max-w-6xl` centered container (see
 * src/app/layout.tsx) via matching negative margins, since these are
 * pre-login entry screens, not part of the app shell — Nav.tsx hides
 * itself on these routes for the same reason.
 */
export function AuthLayout({
  children,
  showcase,
}: {
  children: ReactNode;
  showcase?: ReactNode;
}) {
  return (
    <div className="-mx-4 -my-6 min-h-screen sm:-mx-6 sm:-my-8 lg:flex">
      <div className="flex min-h-screen flex-1 items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
          {children}
        </div>
      </div>
      {showcase && <div className="hidden lg:flex lg:w-[46%] lg:shrink-0">{showcase}</div>}
    </div>
  );
}
