import type { Metadata } from "next";

import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = {
  title: "Login · Ads Manager",
  description: "Sign in with your mobile number to manage your autonomous Meta Ads.",
};

export default function LoginPage() {
  return <LoginView />;
}
