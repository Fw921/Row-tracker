"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { User, Users } from "lucide-react";
import clsx from "clsx";
import { Button, Field, inputClass } from "@/components/ui";
import { PasswordField } from "@/components/auth/PasswordField";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

type Role = "ATHLETE" | "COACH";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ATHLETE");
  const [submitting, setSubmitting] = useState(false);

  // Same caveat as LoginForm: no real auth backend to create an account
  // against yet — this captures the intended fields (including role, which
  // the data model doesn't have yet either) so wiring it up later is a
  // matter of connecting this form, not redesigning it.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    setSubmitting(false);
    toast.info("Account creation isn't connected to a backend yet — this is a preview of the new sign-up screen.");
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        Create your Row Tracker account
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Build your training history and track your progress over time.
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
        <Field label="I am a">
          <div className="grid grid-cols-2 gap-2">
            <RoleOption
              label="Athlete"
              description="Log your own training"
              icon={<User className="h-4 w-4" aria-hidden />}
              active={role === "ATHLETE"}
              onClick={() => setRole("ATHLETE")}
            />
            <RoleOption
              label="Coach"
              description="Track your whole team"
              icon={<Users className="h-4 w-4" aria-hidden />}
              active={role === "COACH"}
              onClick={() => setRole("COACH")}
            />
          </div>
        </Field>

        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            placeholder="Your name"
            className={inputClass}
          />
        </Field>

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

        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint="8+ characters"
        />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent-strong">
          Log in
        </Link>
      </p>
    </div>
  );
}

function RoleOption({
  label,
  description,
  icon,
  active,
  onClick,
}: {
  label: string;
  description: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors duration-150",
        active
          ? "border-accent bg-accent-soft"
          : "border-border hover:border-border-strong hover:bg-background",
      )}
    >
      <span className={clsx("flex items-center gap-1.5 text-sm font-medium", active ? "text-accent-strong" : "text-foreground")}>
        {icon}
        {label}
      </span>
      <span className="text-xs text-muted">{description}</span>
    </button>
  );
}
