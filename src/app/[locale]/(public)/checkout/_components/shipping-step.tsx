"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validators/order";
import { Button, Input } from "@/components/ui";
import { Truck, MapPin, Navigation, Store, Shield, User, Users } from "lucide-react";

type OrderType = "pickup" | "delivery";
type DeliveryTarget = "myself" | "someone_else";

interface ShippingStepProps {
  orderType: OrderType;
  defaultValues?: Partial<ShippingAddressInput>;
  deliveryOption: "standard" | "express";
  onDeliveryOptionChange: (option: "standard" | "express") => void;
  onNext: (data: ShippingAddressInput) => void;
  onPickupNext: () => void;
  selectedLocationName?: string;
  selectedLocationAddress?: string;
}

export function ShippingStep({
  orderType,
  defaultValues,
  deliveryOption,
  onDeliveryOptionChange,
  onNext,
  onPickupNext,
  selectedLocationName,
  selectedLocationAddress,
}: ShippingStepProps) {
  const t = useTranslations("checkout");

  const [deliveryTarget, setDeliveryTarget] = useState<DeliveryTarget>("myself");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoConsent, setGeoConsent] = useState(false);
  const [geoError, setGeoError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues,
  });

  const handleGetLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError(t("geoNotSupported") || "Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use OpenStreetMap Nominatim (free, no API key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            setValue("street", `${addr.road || ""} ${addr.house_number || ""}`.trim() || data.display_name?.split(",")[0] || "");
            setValue("city", addr.city || addr.town || addr.village || "");
            setValue("state", addr.state || "");
            setValue("zip", addr.postcode || "");
          }
        } catch {
          setGeoError(t("geoFetchError") || "Could not fetch address from your location.");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError(t("geoPermissionDenied") || "Location permission denied. Please enter your address manually.");
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError(t("geoUnavailable") || "Location unavailable. Please enter your address manually.");
            break;
          default:
            setGeoError(t("geoTimeout") || "Location request timed out. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [setValue, t]);

  // Pickup flow
  if (orderType === "pickup") {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-brown-900">
          {t("pickupDetails") || "Pickup Details"}
        </h2>

        <div className="rounded-xl border-2 border-terracotta-500/20 bg-terracotta-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-brown-900">
                {t("pickupAt") || "Pick up at"}
              </p>
              <p className="text-sm font-semibold text-terracotta-600">
                {selectedLocationName || "—"}
              </p>
              {selectedLocationAddress && (
                <p className="mt-1 text-sm text-brown-500">{selectedLocationAddress}</p>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-brown-600">
          {t("pickupInfo") || "Your order will be ready for pickup at the selected location. You will receive a notification when it's ready."}
        </p>

        <Button type="button" size="lg" className="w-full" onClick={onPickupNext}>
          {t("continuePayment") || "Continue to Payment"}
        </Button>
      </div>
    );
  }

  // Delivery flow
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-brown-900">{t("shippingTitle")}</h2>

      {/* Delivery target selection */}
      <div>
        <label className="mb-3 block text-sm font-medium text-brown-800">
          {t("deliverTo") || "Deliver to"}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setDeliveryTarget("myself")}
            className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
              deliveryTarget === "myself"
                ? "border-terracotta-500 bg-terracotta-500/5"
                : "border-cream-300 hover:border-cream-400"
            }`}
          >
            <User className="h-5 w-5 text-brown-600" />
            <div>
              <p className="text-sm font-medium text-brown-900">
                {t("deliverMyself") || "My location"}
              </p>
              <p className="text-xs text-brown-500">
                {t("deliverMyselfDesc") || "Deliver to my current address"}
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setDeliveryTarget("someone_else")}
            className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
              deliveryTarget === "someone_else"
                ? "border-terracotta-500 bg-terracotta-500/5"
                : "border-cream-300 hover:border-cream-400"
            }`}
          >
            <Users className="h-5 w-5 text-brown-600" />
            <div>
              <p className="text-sm font-medium text-brown-900">
                {t("deliverSomeoneElse") || "Another address"}
              </p>
              <p className="text-xs text-brown-500">
                {t("deliverSomeoneElseDesc") || "Send to a different location"}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Geolocation button (only for "myself") */}
      {deliveryTarget === "myself" && (
        <div className="space-y-3">
          {!geoConsent ? (
            <div className="rounded-lg border border-cream-200 bg-cream-50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-terracotta-500" />
                <div>
                  <p className="text-sm font-medium text-brown-900">
                    {t("locationConsent") || "Share your location"}
                  </p>
                  <p className="mt-1 text-xs text-brown-600">
                    {t("locationConsentDesc") || "We need your location to auto-fill your delivery address. Your location data is used solely for delivery purposes and is protected in accordance with GDPR, CCPA, and applicable data privacy regulations. We do not store or share your geolocation data with third parties."}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3 gap-2"
                    onClick={() => setGeoConsent(true)}
                  >
                    <Navigation className="h-4 w-4" />
                    {t("authorizeLocation") || "Authorize & detect my location"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={handleGetLocation}
              loading={geoLoading}
            >
              <Navigation className="h-4 w-4" />
              {geoLoading
                ? (t("detectingLocation") || "Detecting location...")
                : (t("useMyLocation") || "Use my current location")}
            </Button>
          )}
          {geoError && (
            <p className="text-xs text-error-500">{geoError}</p>
          )}
        </div>
      )}

      {/* Address form */}
      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label={deliveryTarget === "someone_else" ? (t("recipientName") || "Recipient Name") : t("fullName")}
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
            label={t("phone") || "Phone"}
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
    </div>
  );
}
