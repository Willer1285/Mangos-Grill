"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validators/order";
import { Button, Input } from "@/components/ui";
import { Truck } from "lucide-react";

interface ShippingStepProps {
  defaultValues?: Partial<ShippingAddressInput>;
  deliveryOption: "standard" | "express";
  onDeliveryOptionChange: (option: "standard" | "express") => void;
  onNext: (data: ShippingAddressInput) => void;
}

export function ShippingStep({
  defaultValues,
  deliveryOption,
  onDeliveryOptionChange,
  onNext,
}: ShippingStepProps) {
  const t = useTranslations("checkout");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <h2 className="text-xl font-semibold text-brown-900">{t("shippingTitle")}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label={t("fullName")}
            placeholder="John Doe"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label={t("streetAddress")}
            placeholder="123 Main St, Apt 4B"
            error={errors.street?.message}
            {...register("street")}
          />
        </div>
        <Input
          label={t("city")}
          placeholder="Houston"
          error={errors.city?.message}
          {...register("city")}
        />
        <Input
          label={t("state")}
          placeholder="Texas"
          error={errors.state?.message}
          {...register("state")}
        />
        <Input
          label={t("zip")}
          placeholder="77098"
          error={errors.zip?.message}
          {...register("zip")}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      {/* Delivery option */}
      <div>
        <label className="mb-3 block text-sm font-medium text-brown-800">
          {t("deliveryOption")}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onDeliveryOptionChange("standard")}
            className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
              deliveryOption === "standard"
                ? "border-terracotta-500 bg-terracotta-500/5"
                : "border-cream-300 hover:border-cream-400"
            }`}
          >
            <Truck className="h-5 w-5 text-brown-600" />
            <div>
              <p className="text-sm font-medium text-brown-900">{t("standard")}</p>
              <p className="text-xs text-brown-500">30-45 min</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onDeliveryOptionChange("express")}
            className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
              deliveryOption === "express"
                ? "border-terracotta-500 bg-terracotta-500/5"
                : "border-cream-300 hover:border-cream-400"
            }`}
          >
            <Truck className="h-5 w-5 text-terracotta-500" />
            <div>
              <p className="text-sm font-medium text-brown-900">{t("express")}</p>
              <p className="text-xs text-brown-500">15-20 min</p>
            </div>
          </button>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full">
        {t("continuePayment")}
      </Button>
    </form>
  );
}
