"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/auth";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success(json.message);
      } else {
        toast.error(json.error || "Something went wrong.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-brown-600">
            Invalid or missing reset token.
          </p>
          <Link href="/forgot-password" className="mt-4 inline-block">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("forgotPassword")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-brown-900">
            {t("resetTitle")}
          </h1>
          <p className="mt-1 text-sm text-brown-600">{t("resetDesc")}</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
              <CheckCircle className="h-8 w-8 text-success-500" />
            </div>
            <p className="text-sm text-brown-600">
              {t("passwordResetSuccess")}
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
            <input type="hidden" {...register("token")} />

            <Input
              label={t("newPassword")}
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              label={t("confirmPassword")}
              type="password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button type="submit" className="w-full" loading={loading}>
              {t("resetPassword")}
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
