"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { toast } from "sonner";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Registration failed.");
        return;
      }

      toast.success("Account created! Signing you in...");

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/",
      });
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
          <h1 className="text-2xl font-semibold text-brown-900">{t("register")}</h1>
          <p className="mt-1 text-sm text-brown-600">{t("registerDesc")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t("firstName")}
              placeholder="John"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label={t("lastName")}
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <Input
            label={t("email")}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label={t("phone")}
            type="tel"
            placeholder="+1 (555) 123-4567"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Input
            label={t("password")}
            type="password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label={t("confirmPassword")}
            type="password"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" className="w-full" loading={loading}>
            {t("register")}
          </Button>
        </form>

        {/* OAuth divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-cream-300" />
          <span className="text-xs text-brown-500">{t("orContinue")}</span>
          <div className="h-px flex-1 bg-cream-300" />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 gap-2"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t("google")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1 gap-2"
            onClick={() => signIn("apple", { callbackUrl: "/" })}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            {t("apple")}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-brown-600">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-medium text-terracotta-500 hover:text-terracotta-600">
            {t("login")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
