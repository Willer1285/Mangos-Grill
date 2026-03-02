"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators/auth";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSent(true);
        toast.success("Check your email for a reset link.");
      } else {
        const json = await res.json();
        toast.error(json.error || "Something went wrong.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
              We&apos;ve sent a password reset link to your email. Check your inbox and follow the instructions.
            </p>
            <Link href="/login" className="mt-4 inline-block">
              <Button variant="secondary" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t("backToLogin")}
              </Button>
            </Link>
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
