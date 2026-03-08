"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Stepper } from "@/components/ui";
import { useCart } from "@/lib/cart/cart-context";
import { ShippingStep } from "./_components/shipping-step";
import { PaymentStep, type PaymentData } from "./_components/payment-step";
import { ReviewStep } from "./_components/review-step";
import { OrderSummarySidebar } from "./_components/order-summary-sidebar";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import type { ShippingAddressInput } from "@/lib/validators/order";

interface Location {
  _id: string;
  name: string;
  address: string;
}

function useCheckoutSteps() {
  const t = useTranslations("checkout");
  return [
    { label: t("shipping") },
    { label: t("payment") },
    { label: t("review") },
  ];
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const router = useRouter();
  const { state, clearCart, subtotal } = useCart();
  const checkoutSteps = useCheckoutSteps();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingAddressInput | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "zelle" | "binance">("credit_card");
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data = await res.json();
          setLocations(data);
          if (data.length === 1) setSelectedLocation(data[0].name);
        }
      } catch {
        /* empty */
      }
    }
    fetchLocations();
  }, []);

  // Redirect if cart empty
  if (state.items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-brown-900">{tc("empty")}</h1>
        <p className="mt-2 text-brown-600">{tc("emptyDesc")}</p>
        <button
          onClick={() => router.push("/menu")}
          className="mt-6 text-sm font-medium text-terracotta-500 hover:text-terracotta-600"
        >
          {tc("browseMenu")}
        </button>
      </section>
    );
  }

  function handleShippingNext(data: ShippingAddressInput) {
    setShippingData(data);
    setCurrentStep(2);
  }

  function handlePaymentNext(data: PaymentData) {
    setPaymentData(data);
    setCurrentStep(3);
  }

  async function handlePlaceOrder() {
    if (!shippingData || !paymentData || !selectedLocation) return;

    setLoading(true);
    try {
      const orderPayload = {
        items: state.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          modifiers: item.modifiers,
          extras: item.extras,
        })),
        deliveryType: "Delivery" as const,
        deliveryAddress: shippingData,
        location: selectedLocation,
        paymentMethod: paymentData.method,
        promoCode: state.promoCode || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Failed to place order.");
        return;
      }

      const { orderNumber } = await res.json();
      clearCart();
      router.push(`/order-success?order=${orderNumber}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <section className="bg-brown-800 py-8 text-center">
        <h1 className="text-3xl font-semibold text-white">{t("shipping")}</h1>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Location Selector */}
        {locations.length > 1 && (
          <div className="mb-8">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-brown-900">
              <MapPin className="h-4 w-4 text-terracotta-500" />
              {t("selectLocation")}
            </label>
            <div className="flex flex-wrap gap-3">
              {locations.map((loc) => (
                <button
                  key={loc._id}
                  type="button"
                  onClick={() => setSelectedLocation(loc.name)}
                  className={`rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all ${
                    selectedLocation === loc.name
                      ? "border-terracotta-500 bg-terracotta-500/10 text-terracotta-600"
                      : "border-cream-200 bg-white text-brown-700 hover:border-terracotta-300"
                  }`}
                >
                  <span className="font-semibold">{loc.name}</span>
                  <span className="mt-0.5 block text-xs text-brown-500">{loc.address}</span>
                </button>
              ))}
            </div>
            {!selectedLocation && (
              <p className="mt-2 text-xs text-error-500">{t("selectLocationRequired")}</p>
            )}
          </div>
        )}

        {/* Stepper */}
        <Stepper
          steps={checkoutSteps}
          currentStep={currentStep}
          className="mb-10"
        />

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="flex-1">
            {currentStep === 1 && (
              <ShippingStep
                defaultValues={shippingData || undefined}
                deliveryOption={deliveryOption}
                onDeliveryOptionChange={setDeliveryOption}
                onNext={handleShippingNext}
              />
            )}
            {currentStep === 2 && (
              <PaymentStep
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                onNext={handlePaymentNext}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && shippingData && paymentData && (
              <ReviewStep
                shippingData={shippingData}
                paymentData={paymentData}
                deliveryOption={deliveryOption}
                onEditShipping={() => setCurrentStep(1)}
                onEditPayment={() => setCurrentStep(2)}
                onPlaceOrder={handlePlaceOrder}
                loading={loading}
              />
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <aside className="w-full shrink-0 lg:w-80">
            <OrderSummarySidebar deliveryOption={deliveryOption} />
          </aside>
        </div>
      </section>
    </>
  );
}
