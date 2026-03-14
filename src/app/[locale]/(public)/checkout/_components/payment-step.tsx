"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";
import { CreditCard, Wallet, ArrowLeft, Upload, Banknote, X, Copy, Check } from "lucide-react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import Image from "next/image";

interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  type: "automatic" | "manual";
  fields?: { label: string; value: string }[];
}

interface PaymentStepProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onNext: (data: PaymentData) => void;
  onBack: () => void;
}

export interface PaymentData {
  method: string;
  methodType: "automatic" | "manual";
  cardholderName?: string;
  receiptFile?: File | null;
  referenceNumber?: string;
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

function CopyableValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-cream-200 bg-white px-3 py-2">
      <div>
        <p className="text-xs text-brown-500">{label}</p>
        <p className="text-sm font-medium text-brown-900">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="ml-2 rounded-md p-1.5 text-brown-400 transition-colors hover:bg-cream-100 hover:text-brown-600"
        title="Copy"
      >
        {copied ? <Check className="h-4 w-4 text-success-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
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
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [stripeAvailable, setStripeAvailable] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStripeAvailable(!!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }, []);

  useEffect(() => {
    async function fetchMethods() {
      try {
        const res = await fetch("/api/payment-methods");
        if (res.ok) {
          const data = await res.json();
          setPaymentMethods(data);
          if (data.length > 0 && !data.find((m: PaymentMethodConfig) => m.id === selectedMethod)) {
            onMethodChange(data[0].id);
          }
        }
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    }
    fetchMethods();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (receiptFile) {
      const url = URL.createObjectURL(receiptFile);
      setReceiptPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setReceiptPreview(null);
  }, [receiptFile]);

  const selectedConfig = paymentMethods.find((m) => m.id === selectedMethod);
  const isStripe = selectedMethod === "stripe";
  const isCash = selectedMethod === "cash";
  const isManual = selectedConfig?.type === "manual";

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      toast.error("Please enter the reference/confirmation number");
      return;
    }
    if (!receiptFile) {
      toast.error("Please upload the payment receipt");
      return;
    }
    onNext({
      method: selectedMethod,
      methodType: "manual",
      receiptFile,
      referenceNumber: referenceNumber.trim(),
    });
  }

  function handleCashSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      method: "cash",
      methodType: "automatic",
    });
  }

  function handleStripeSubmit(paymentMethodId: string) {
    onNext({
      method: "stripe",
      methodType: "automatic",
      cardholderName,
      stripePaymentMethodId: paymentMethodId,
    });
  }

  function getMethodIcon(method: PaymentMethodConfig) {
    if (method.id === "stripe") return <CreditCard className="h-5 w-5" />;
    if (method.id === "cash") return <Banknote className="h-5 w-5" />;
    return <Wallet className="h-5 w-5" />;
  }

  function getMethodDesc(method: PaymentMethodConfig) {
    if (method.id === "stripe") return "Visa, Mastercard, Amex";
    if (method.id === "cash") return t("cashDesc") || "Pay in cash at pickup/delivery";
    if (method.fields && method.fields.length > 0) {
      return method.fields.map((f) => `${f.label}: ${f.value}`).join(" | ");
    }
    return "";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-brown-900">{t("paymentMethod")}</h2>

      {/* Method selection */}
      <div className="space-y-3">
        {paymentMethods.map((pm) => (
          <button
            key={pm.id}
            type="button"
            onClick={() => {
              onMethodChange(pm.id);
              setReceiptFile(null);
              setReferenceNumber("");
            }}
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
              {getMethodIcon(pm)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-brown-900">{pm.name}</p>
              <p className="text-xs text-brown-500">{getMethodDesc(pm)}</p>
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

      {/* Stripe card form */}
      {isStripe && (
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
            <div className="space-y-4">
              <p className="rounded-md bg-warning-500/10 p-3 text-xs text-brown-700">
                {t("stripeNotConfigured") || "Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable card payments."}
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" size="lg" onClick={onBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cash payment */}
      {isCash && (
        <form onSubmit={handleCashSubmit} className="space-y-4">
          <div className="rounded-lg border border-cream-200 bg-cream-50 p-4">
            <div className="rounded-md bg-success-500/10 p-3">
              <p className="text-sm text-brown-700">
                {t("cashInstructions") || "Pay in cash when you receive your order. No additional steps needed."}
              </p>
            </div>
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

      {/* Manual payment methods (Binance, Zelle, etc.) */}
      {isManual && selectedConfig && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="rounded-lg border border-cream-200 bg-cream-50 p-4 space-y-4">
            {/* Payment details from config */}
            {selectedConfig.fields && selectedConfig.fields.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-brown-800">
                  {t("paymentDetails") || "Payment Details"}
                </p>
                {selectedConfig.fields.map((field, idx) => (
                  <CopyableValue key={idx} label={field.label} value={field.value} />
                ))}
              </div>
            )}

            <div className="rounded-md bg-warning-500/10 p-3">
              <p className="text-sm text-brown-700">
                {t("manualPaymentInstructions") || `Send payment via ${selectedConfig.name}, then upload your receipt and enter the reference number below.`}
              </p>
            </div>

            {/* Reference number */}
            <div>
              <Input
                label={t("referenceNumber") || "Reference / Confirmation Number"}
                placeholder={t("referenceNumberPlaceholder") || "Enter the transaction reference number"}
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                required
              />
            </div>

            {/* Receipt upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-brown-800">
                {t("uploadReceipt") || "Upload Receipt"}
              </label>
              {receiptPreview ? (
                <div className="relative">
                  <div className="relative overflow-hidden rounded-lg border border-cream-300 bg-white">
                    <div className="relative aspect-video w-full">
                      <Image
                        src={receiptPreview}
                        alt="Receipt preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between border-t border-cream-200 px-3 py-2">
                      <span className="text-xs text-brown-600 truncate max-w-[200px]">
                        {receiptFile?.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReceiptFile(null)}
                        className="rounded-md p-1 text-brown-400 hover:bg-cream-100 hover:text-error-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-cream-300 p-6 transition-colors hover:border-terracotta-500 hover:bg-cream-100">
                  <Upload className="mb-2 h-8 w-8 text-brown-400" />
                  <span className="text-sm font-medium text-brown-700">
                    {t("clickToUploadReceipt") || "Click to upload receipt"}
                  </span>
                  <span className="mt-1 text-xs text-brown-500">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>

            <p className="text-xs text-brown-500">
              {t("manualPaymentNote") || "Your order will remain in \"Pending\" status until an admin verifies your payment."}
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="lg" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" size="lg" className="flex-1" disabled={!receiptFile || !referenceNumber.trim()}>
              {t("continueReview")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
