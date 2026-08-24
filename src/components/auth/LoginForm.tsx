"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Field, inputClass } from "@/components/ui";
import { PasswordField } from "@/components/auth/PasswordField";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // NOTE: Row Tracker doesn't have real authentication yet (see
  // src/lib/current-user.ts — it's still a single seeded account, and
  // getCurrentUser() always resolves it regardless of who "logs in"). So
  // this form doesn't check the email/password against anything — it just
  // takes you into that one account, which is honest about all there is
  // right now. Wiring this up to real sessions/password checks/Google
  // OAuth is separate follow-up work once an auth provider is chosen.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    toast.info("Row Tracker doesn't check passwords yet — this opens the one account it has.");
    router.push("/dashboard");
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        Welcome back to Row Tracker
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Track your training. Understand your performance. Row stronger.
      </p>

      <div className="mt-7">
        <Button type="button" variant="secondary" disabled className="w-full">
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </Button>
        <p className="mt-1.5 text-center text-xs text-muted-soft">Coming soon</p>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-soft">
        <div className="h-px flex-1 bg-border" />
        or continue with email
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="you@yourteam.com"
            className={inputClass}
          />
        </Field>

        <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="current-password" />

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs font-medium text-accent hover:text-accent-strong">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to Row Tracker?{" "}
        <Link href="/signup" className="font-medium text-accent hover:text-accent-strong">
          Create an account
        </Link>
      </p>
    </div>
  );
}
