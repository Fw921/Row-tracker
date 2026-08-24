import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset password · Row Tracker" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout showcase={<AuthShowcase />}>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
