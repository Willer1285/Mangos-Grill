"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators/auth";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const RESEND_COOLDOWN = 60; // seconds

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [lastEmail, setLastEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendEmail = useCallback(
    async (email: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (res.ok) {
          setSent(true);
          setLastEmail(email);
          setCountdown(RESEND_COOLDOWN);
          toast.success(t("checkEmailForReset"));
        } else {
          const json = await res.json();
          toast.error(json.error || "Something went wrong.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  async function onSubmit(data: ForgotPasswordInput) {
    await sendEmail(data.email);
  }

  async function handleResend() {
    if (countdown > 0 || !lastEmail) return;
    await sendEmail(lastEmail);
    toast.success(t("resetLinkResent"));
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-brown-900">{t("forgotTitle")}</h1>
          <p className="mt-1 text-sm text-brown-600">{t("forgotDesc")}</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
              <svg className="h-8 w-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-brown-600">
              {t("resetEmailSent")}
            </p>

            <div className="mt-6 space-y-3">
              <Button
                variant="secondary"
                className="w-full"
                disabled={countdown > 0 || loading}
                loading={loading}
                onClick={handleResend}
              >
                {countdown > 0
                  ? t("resendIn", { seconds: countdown })
                  : t("resendEmail")}
              </Button>

              <Link href="/login" className="inline-block">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("backToLogin")}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t("email")}
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Button type="submit" className="w-full" loading={loading}>
              {t("sendResetLink")}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-terracotta-500 hover:text-terracotta-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("backToLogin")}
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
