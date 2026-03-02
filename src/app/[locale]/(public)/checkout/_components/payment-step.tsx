"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";
import { CreditCard, Wallet, ArrowLeft, Upload } from "lucide-react";

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      method: selectedMethod,
      cardholderName: selectedMethod === "credit_card" ? cardholderName : undefined,
      receiptFile: selectedMethod !== "credit_card" ? receiptFile : null,
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Credit card form */}
      {selectedMethod === "credit_card" && (
        <div className="space-y-4 rounded-lg border border-cream-200 bg-cream-50 p-4">
          <Input
            label={t("cardholderName")}
            placeholder="John Doe"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />
          <Input
            label={t("cardNumber")}
            placeholder="4242 4242 4242 4242"
            disabled
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t("expiryDate")} placeholder="MM/YY" disabled />
            <Input label={t("cvc")} placeholder="123" disabled />
          </div>
          <p className="text-xs text-brown-500">
            Card payment will be processed securely via Stripe at order placement.
          </p>
        </div>
      )}

      {/* Zelle / Binance instructions */}
      {(selectedMethod === "zelle" || selectedMethod === "binance") && (
        <div className="space-y-4 rounded-lg border border-cream-200 bg-cream-50 p-4">
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
      )}

      {/* Billing = Shipping checkbox (credit card only) */}
      {selectedMethod === "credit_card" && (
        <label className="flex items-center gap-2 text-sm text-brown-700">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-cream-300 text-terracotta-500 focus:ring-terracotta-500"
          />
          {t("billingAddress")}
        </label>
      )}

      {/* Actions */}
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
  );
}
