import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create your account · Row Tracker" };

export default function SignupPage() {
  return (
    <AuthLayout showcase={<AuthShowcase />}>
      <SignupForm />
    </AuthLayout>
  );
}
