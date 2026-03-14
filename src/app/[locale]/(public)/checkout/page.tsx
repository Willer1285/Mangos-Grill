"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Stepper, Button } from "@/components/ui";
import { useCart } from "@/lib/cart/cart-context";
import { ShippingStep } from "./_components/shipping-step";
import { PaymentStep, type PaymentData } from "./_components/payment-step";
import { ReviewStep } from "./_components/review-step";
import { OrderSummarySidebar } from "./_components/order-summary-sidebar";
import { CheckoutLoginPrompt } from "./_components/checkout-login-prompt";
import { toast } from "sonner";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { MapPin, Store, Truck } from "lucide-react";
import type { ShippingAddressInput } from "@/lib/validators/order";

let _stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise() {
  if (!_stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key) _stripePromise = loadStripe(key);
  }
  return _stripePromise;
}

type OrderType = "pickup" | "delivery";

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
  const { data: session, status: authStatus } = useSession();
  const checkoutSteps = useCheckoutSteps();

  const [currentStep, setCurrentStep] = useState(1);
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [shippingData, setShippingData] = useState<ShippingAddressInput | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<string>("stripe");
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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

  function handlePickupNext() {
    // For pickup, we don't need shipping address data
    setShippingData(null);
    setCurrentStep(2);
  }

  function handlePaymentNext(data: PaymentData) {
    setPaymentData(data);
    setCurrentStep(3);
  }

  async function handlePlaceOrder() {
    if (!paymentData || !selectedLocation) return;
    if (orderType === "delivery" && !shippingData) return;

    // Check if user is logged in before placing order
    if (authStatus !== "authenticated") {
      setShowLoginPrompt(true);
      return;
    }

    setLoading(true);
    try {
      // Step 1: For Stripe, create payment intent and confirm
      let stripePaymentIntentId: string | undefined;
      if (paymentData.method === "stripe" && paymentData.stripePaymentMethodId) {
        const intentRes = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: subtotal * 1.0825, currency: "usd" }),
        });
        if (!intentRes.ok) {
          toast.error("Failed to process card payment.");
          return;
        }
        const { clientSecret, paymentIntentId } = await intentRes.json();
        stripePaymentIntentId = paymentIntentId;

        // Confirm the payment on the client
        const stripeJs = await getStripePromise();
        if (stripeJs && clientSecret) {
          const { error: confirmError } = await stripeJs.confirmCardPayment(clientSecret, {
            payment_method: paymentData.stripePaymentMethodId,
          });
          if (confirmError) {
            toast.error(confirmError.message || "Payment failed.");
            return;
          }
        }
      }

      // Step 2: Create the order
      const orderPayload = {
        items: state.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          modifiers: item.modifiers,
          extras: item.extras,
        })),
        deliveryType: orderType === "pickup" ? "Pickup" : "Delivery",
        deliveryAddress: orderType === "delivery" ? shippingData : undefined,
        location: selectedLocation,
        paymentMethod: paymentData.method,
        methodType: paymentData.methodType,
        stripePaymentIntentId,
        referenceNumber: paymentData.referenceNumber,
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

      const { orderNumber, orderId } = await res.json();

      // Step 3: For manual payments, upload receipt
      if (paymentData.methodType === "manual" && paymentData.receiptFile) {
        const formData = new FormData();
        formData.append("file", paymentData.receiptFile);
        formData.append("orderId", orderId);
        formData.append("paymentMethod", paymentData.method);
        formData.append("reference", paymentData.referenceNumber || "");

        await fetch("/api/payments/upload-receipt", {
          method: "POST",
          body: formData,
        });
      }

      clearCart();
      if (paymentData.methodType === "manual") {
        router.push(`/order-success?order=${orderNumber}&pending=true`);
      } else {
        router.push(`/order-success?order=${orderNumber}`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isPickup = orderType === "pickup";

  return (
    <>
      {/* Header */}
      <section className="bg-brown-800 py-8 text-center">
        <h1 className="text-3xl font-semibold text-white">{t("title") || "Checkout"}</h1>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="min-w-0 flex-1 rounded-2xl border border-cream-200 bg-white p-6">
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

            {/* Order Type Selection */}
            <div className="mb-8">
              <label className="mb-3 block text-sm font-semibold text-brown-900">
                {t("orderType") || "Order Type"}
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    orderType === "pickup"
                      ? "border-terracotta-500 bg-terracotta-500/5 shadow-sm"
                      : "border-cream-300 hover:border-cream-400"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      orderType === "pickup"
                        ? "bg-terracotta-500 text-white"
                        : "bg-cream-200 text-brown-600"
                    }`}
                  >
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brown-900">{t("pickup") || "Pickup"}</p>
                    <p className="text-xs text-brown-500">
                      {t("pickupDesc") || "Pick up your order at the selected location"}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("delivery")}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    orderType === "delivery"
                      ? "border-terracotta-500 bg-terracotta-500/5 shadow-sm"
                      : "border-cream-300 hover:border-cream-400"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      orderType === "delivery"
                        ? "bg-terracotta-500 text-white"
                        : "bg-cream-200 text-brown-600"
                    }`}
                  >
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brown-900">{t("delivery") || "Delivery"}</p>
                    <p className="text-xs text-brown-500">
                      {t("deliveryDesc") || "We deliver to your address"}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Stepper */}
            <Stepper
              steps={checkoutSteps}
              currentStep={currentStep}
              className="mb-10 w-full"
            />

            {/* Step Content */}
            {currentStep === 1 && (
              <ShippingStep
                orderType={orderType}
                defaultValues={shippingData || undefined}
                deliveryOption={deliveryOption}
                onDeliveryOptionChange={setDeliveryOption}
                onNext={handleShippingNext}
                onPickupNext={handlePickupNext}
                selectedLocationName={selectedLocation}
                selectedLocationAddress={locations.find((l) => l.name === selectedLocation)?.address}
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
            {currentStep === 3 && paymentData && (
              <ReviewStep
                orderType={orderType}
                shippingData={shippingData}
                paymentData={paymentData}
                deliveryOption={isPickup ? "standard" : deliveryOption}
                onEditShipping={() => setCurrentStep(1)}
                onEditPayment={() => setCurrentStep(2)}
                onPlaceOrder={handlePlaceOrder}
                loading={loading}
                selectedLocationName={selectedLocation}
                selectedLocationAddress={locations.find((l) => l.name === selectedLocation)?.address}
              />
            )}
          </div>

          {/* Sidebar - Order Summary (sticky) */}
          <aside className="w-full shrink-0 lg:w-80 lg:self-start lg:sticky lg:top-24">
            <OrderSummarySidebar
              deliveryOption={isPickup ? "standard" : deliveryOption}
              isPickup={isPickup}
            />
          </aside>
        </div>
      </section>

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <CheckoutLoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}
    </>
  );
}
