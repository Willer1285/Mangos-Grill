"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";
import { CreditCard, Wallet, ArrowLeft, Upload } from "lucide-react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

type PaymentMethodType = "credit_card" | "zelle" | "binance";

interface PaymentStepProps {
  selectedMethod: PaymentMethodType;
  onMethodChange: (method: PaymentMethodType) => void;
  onNext: (data: PaymentData) => void;
  onBack: () => void;
}

export interface PaymentData {
  method: PaymentMethodType;
  cardholderName?: string;
  receiptFile?: File | null;
  stripePaymentMethodId?: string;
}

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key) {
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
}

function StripeCardForm({
  cardholderName,
  setCardholderName,
  onSubmit,
  onBack,
  t,
}: {
  cardholderName: string;
  setCardholderName: (v: string) => void;
  onSubmit: (paymentMethodId: string) => void;
  onBack: () => void;
  t: (key: string) => string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found");
      setLoading(false);
      return;
    }

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: { name: cardholderName },
    });

    if (stripeError) {
      setError(stripeError.message || "Card error");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSubmit(paymentMethod.id);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t("cardholderName")}
        placeholder="John Doe"
        value={cardholderName}
        onChange={(e) => setCardholderName(e.target.value)}
        required
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brown-700">
          {t("cardDetails") || "Card Details"}
        </label>
        <div className="rounded-lg border border-cream-300 bg-white p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#3d2c1e",
                  "::placeholder": { color: "#a09082" },
                },
                invalid: { color: "#ef4444" },
              },
            }}
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-error-500">{error}</p>
      )}
      <p className="text-xs text-brown-500">
        {t("stripeSecure") || "Your payment is processed securely via Stripe. We never store your card details."}
      </p>
      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" loading={loading} disabled={!stripe}>
          {t("continueReview")}
        </Button>
      </div>
    </form>
  );
}

export function PaymentStep({
  selectedMethod,
  onMethodChange,
  onNext,
  onBack,
}: PaymentStepProps) {
  const t = useTranslations("checkout");
  const [cardholderName, setCardholderName] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [stripeAvailable, setStripeAvailable] = useState(false);

  useEffect(() => {
    setStripeAvailable(!!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }, []);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      method: selectedMethod,
      receiptFile,
    });
  }

  function handleStripeSubmit(paymentMethodId: string) {
    onNext({
      method: "credit_card",
      cardholderName,
      stripePaymentMethodId: paymentMethodId,
    });
  }

  const paymentMethods: {
    id: PaymentMethodType;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      id: "credit_card",
      label: t("creditCard"),
      icon: <CreditCard className="h-5 w-5" />,
      desc: "Visa, Mastercard, Amex",
    },
    {
      id: "zelle",
      label: "Zelle",
      icon: <Wallet className="h-5 w-5" />,
      desc: "Send to hello@mangosgrill.com",
    },
    {
      id: "binance",
      label: "Binance Pay",
      icon: <Wallet className="h-5 w-5" />,
      desc: "Pay ID: 285937461",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-brown-900">{t("paymentMethod")}</h2>

      {/* Method selection */}
      <div className="space-y-3">
        {paymentMethods.map((pm) => (
          <button
            key={pm.id}
            type="button"
            onClick={() => onMethodChange(pm.id)}
            className={`flex w-full items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
              selectedMethod === pm.id
                ? "border-terracotta-500 bg-terracotta-500/5"
                : "border-cream-300 hover:border-cream-400"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                selectedMethod === pm.id
                  ? "bg-terracotta-500 text-white"
                  : "bg-cream-200 text-brown-600"
              }`}
            >
              {pm.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-brown-900">{pm.label}</p>
              <p className="text-xs text-brown-500">{pm.desc}</p>
            </div>
            <div className="ml-auto">
              <div
                className={`h-5 w-5 rounded-full border-2 ${
                  selectedMethod === pm.id
                    ? "border-terracotta-500 bg-terracotta-500"
                    : "border-cream-400"
                }`}
              >
                {selectedMethod === pm.id && (
                  <svg className="h-full w-full text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Credit card form with Stripe Elements */}
      {selectedMethod === "credit_card" && (
        <div className="rounded-lg border border-cream-200 bg-cream-50 p-4">
          {stripeAvailable ? (
            <Elements stripe={getStripePromise()}>
              <StripeCardForm
                cardholderName={cardholderName}
                setCardholderName={setCardholderName}
                onSubmit={handleStripeSubmit}
                onBack={onBack}
                t={t}
              />
            </Elements>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); onNext({ method: "credit_card", cardholderName }); }} className="space-y-4">
              <Input
                label={t("cardholderName")}
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
              />
              <p className="rounded-md bg-warning-500/10 p-3 text-xs text-brown-700">
                {t("stripeNotConfigured") || "Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable card payments."}
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" size="lg" onClick={onBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" size="lg" className="flex-1">
                  {t("continueReview")}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Zelle / Binance instructions */}
      {(selectedMethod === "zelle" || selectedMethod === "binance") && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="rounded-lg border border-cream-200 bg-cream-50 p-4 space-y-4">
            <div className="rounded-md bg-warning-500/10 p-3">
              <p className="text-sm text-brown-700">
                {selectedMethod === "zelle"
                  ? "Please send payment to hello@mangosgrill.com via Zelle, then upload your receipt below."
                  : "Please send payment to Binance Pay ID: 285937461, then upload your receipt below."}
              </p>
            </div>

            {/* Receipt upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-brown-800">
                Upload Receipt
              </label>
              <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-cream-300 p-6 transition-colors hover:border-terracotta-500 hover:bg-cream-100">
                <Upload className="mb-2 h-8 w-8 text-brown-400" />
                <span className="text-sm font-medium text-brown-700">
                  {receiptFile ? receiptFile.name : "Click to upload receipt"}
                </span>
                <span className="mt-1 text-xs text-brown-500">PNG, JPG, PDF up to 5MB</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <p className="text-xs text-brown-500">
              Your order will remain in &quot;Pending&quot; status until an admin verifies your payment.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="lg" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" size="lg" className="flex-1">
              {t("continueReview")}
            </Button>
          </div>
        </form>
      )}

      {/* Billing = Shipping checkbox (credit card only - outside Stripe form when Stripe not available) */}
      {selectedMethod === "credit_card" && !stripeAvailable && (
        <label className="flex items-center gap-2 text-sm text-brown-700">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-cream-300 text-terracotta-500 focus:ring-terracotta-500"
          />
          {t("billingAddress")}
        </label>
      )}
    </div>
  );
}
