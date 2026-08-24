"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, inputClass } from "@/components/ui";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // No email-sending infrastructure exists yet — real password reset needs
  // both that and the real auth backend from LoginForm's note.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    setSubmitting(false);
    toast.info("Password reset isn't available yet — Row Tracker doesn't have real accounts to reset.");
  }

  return (
    <div>
      <Link
        href="/login"
        className="mb-4 flex items-center gap-0.5 text-sm font-medium text-accent hover:text-accent-strong"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back to login
      </Link>

      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        Reset your password
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Enter the email on your account and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
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

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
