"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { ArrowLeft, Lock, Edit2, ShoppingBag, Store } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { useBrand, formatPrice } from "@/lib/brand/brand-context";
import { TX_TAX_RATE } from "@/lib/constants";
import type { ShippingAddressInput } from "@/lib/validators/order";
import type { PaymentData } from "./payment-step";

type OrderType = "pickup" | "delivery";

interface ReviewStepProps {
  orderType: OrderType;
  shippingData: ShippingAddressInput | null;
  paymentData: PaymentData;
  deliveryOption: "standard" | "express";
  onEditShipping: () => void;
  onEditPayment: () => void;
  onPlaceOrder: () => void;
  loading: boolean;
  selectedLocationName?: string;
  selectedLocationAddress?: string;
}

const SHIPPING_COSTS = { standard: 0, express: 12.99 } as const;

export function ReviewStep({
  orderType,
  shippingData,
  paymentData,
  deliveryOption,
  onEditShipping,
  onEditPayment,
  onPlaceOrder,
  loading,
  selectedLocationName,
  selectedLocationAddress,
}: ReviewStepProps) {
  const t = useTranslations("checkout");
  const { currency } = useBrand();
  const { state, subtotal } = useCart();

  const isPickup = orderType === "pickup";
  const shippingCost = isPickup ? 0 : SHIPPING_COSTS[deliveryOption];
  const tax = subtotal * TX_TAX_RATE;
  const discount = state.promoDiscount;
  const total = subtotal + tax + shippingCost - discount;

  const paymentLabel =
    paymentData.method === "credit_card"
      ? "Credit Card"
      : paymentData.method === "zelle"
        ? "Zelle"
        : "Binance Pay";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-brown-900">{t("review")}</h2>

      {/* Items */}
      <div className="rounded-lg border border-cream-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brown-900">{t("orderSummary")}</h3>
          <span className="text-xs text-brown-500">{state.items.length} items</span>
        </div>
        <ul className="divide-y divide-cream-200">
          {state.items.map((item) => {
            const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
            const lineTotal = (item.price + extrasTotal) * item.quantity;
            return (
              <li key={item.productId} className="flex items-center gap-3 py-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-cream-200">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full rounded-md object-cover" />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-cream-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brown-900">{item.name}</p>
                  <p className="text-xs text-brown-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-brown-900">{formatPrice(lineTotal, currency)}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Shipping address or Pickup location */}
      <div className="rounded-lg border border-cream-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brown-900">
            {isPickup ? (t("pickupLocation") || "Pickup Location") : t("shippingTitle")}
          </h3>
          <button onClick={onEditShipping} className="flex items-center gap-1 text-xs text-terracotta-500 hover:text-terracotta-600">
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
        {isPickup ? (
          <div className="mt-2 flex items-start gap-2 text-sm text-brown-600">
            <Store className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" />
            <div>
              <p className="font-medium text-brown-900">{selectedLocationName}</p>
              {selectedLocationAddress && <p>{selectedLocationAddress}</p>}
            </div>
          </div>
        ) : shippingData ? (
          <>
            <div className="mt-2 text-sm text-brown-600">
              <p className="font-medium text-brown-900">{shippingData.fullName}</p>
              <p>{shippingData.street}</p>
              <p>{shippingData.city}, {shippingData.state} {shippingData.zip}</p>
              <p>{shippingData.phone}</p>
            </div>
            <div className="mt-2 text-xs text-brown-500">
              Delivery: {deliveryOption === "express" ? "Express (15-20 min)" : "Standard (30-45 min)"}
              {shippingCost > 0 && ` — ${formatPrice(shippingCost, currency)}`}
            </div>
          </>
        ) : null}
      </div>

      {/* Payment method */}
      <div className="rounded-lg border border-cream-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brown-900">{t("paymentMethod")}</h3>
          <button onClick={onEditPayment} className="flex items-center gap-1 text-xs text-terracotta-500 hover:text-terracotta-600">
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
        <p className="mt-2 text-sm text-brown-600">{paymentLabel}</p>
        {paymentData.cardholderName && (
          <p className="text-xs text-brown-500">{paymentData.cardholderName}</p>
        )}
      </div>

      {/* Total breakdown */}
      <div className="rounded-lg border-2 border-terracotta-500/20 bg-terracotta-500/5 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-brown-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-brown-600">
            <span>Tax (8.25%)</span>
            <span>{formatPrice(tax, currency)}</span>
          </div>
          {!isPickup && (
            <div className="flex justify-between text-brown-600">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost, currency)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-success-500">
              <span>Discount ({state.promoCode})</span>
              <span>-{formatPrice(discount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-terracotta-500/20 pt-2 text-lg font-semibold text-terracotta-500">
            <span>Total</span>
            <span>{formatPrice(total, currency)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={onEditPayment} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1 gap-2 bg-gold-500 hover:bg-gold-500/90"
          onClick={onPlaceOrder}
          loading={loading}
        >
          <Lock className="h-4 w-4" />
          {t("placeOrder")}
        </Button>
      </div>
    </div>
  );
}
