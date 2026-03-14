"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";
import { X, LogIn, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface CheckoutLoginPromptProps {
  onClose: () => void;
}

export function CheckoutLoginPrompt({ onClose }: CheckoutLoginPromptProps) {
  const t = useTranslations("checkout");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("loginError") || "Invalid email or password. Please try again.");
    } else {
      // Login successful - close modal, session will update automatically
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-900">
            {t("loginRequired") || "Login Required"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-brown-400 hover:bg-cream-200 hover:text-brown-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm text-brown-600">
          {t("loginRequiredDesc") || "Please log in to complete your order. Your cart will be preserved."}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-error-500/10 p-3 text-sm text-error-500">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label={t("email") || "Email"}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t("password") || "Password"}
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" size="lg" className="w-full gap-2" loading={loading}>
            <LogIn className="h-4 w-4" />
            {t("loginAndContinue") || "Log In & Continue"}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-brown-500">{t("orContinueWith") || "or continue with"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => signIn("google", { callbackUrl: window.location.href })}
            >
              <Mail className="h-4 w-4" />
              Google
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => signIn("apple", { callbackUrl: window.location.href })}
            >
              Apple
            </Button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-brown-500">
          {t("noAccount") || "Don't have an account?"}{" "}
          <Link href="/register" className="font-medium text-terracotta-500 hover:text-terracotta-600">
            {t("register") || "Register"}
          </Link>
        </p>
      </div>
    </div>
  );
}
