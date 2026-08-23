import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in · Row Tracker" };

export default function LoginPage() {
  return (
    <AuthLayout showcase={<AuthShowcase />}>
      <LoginForm />
    </AuthLayout>
  );
}
