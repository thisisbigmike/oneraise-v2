import type { Metadata } from "next";
import { ForgotView } from "@/components/auth/forgot-view";

export const metadata: Metadata = { title: "Reset your password — OneRaise" };

export default function ForgotPasswordPage() {
  return <ForgotView />;
}
