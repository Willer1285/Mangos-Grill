"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { useBrand, formatPrice } from "@/lib/brand/brand-context";
import { TX_TAX_RATE } from "@/lib/constants";

interface OrderSummarySidebarProps {
  deliveryOption: "standard" | "express";
}

const SHIPPING_COSTS = { standard: 0, express: 12.99 } as const;

export function OrderSummarySidebar({ deliveryOption }: OrderSummarySidebarProps) {
  const t = useTranslations("checkout");
  const { currency } = useBrand();
  const { state, subtotal } = useCart();

  const shippingCost = SHIPPING_COSTS[deliveryOption];
  const tax = subtotal * TX_TAX_RATE;
  const discount = state.promoDiscount;
  const total = subtotal + tax + shippingCost - discount;

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-brown-900">{t("orderSummary")}</h3>

        {state.items.length === 0 ? (
          <div className="py-6 text-center">
            <ShoppingBag className="mx-auto mb-2 h-10 w-10 text-cream-400" />
            <p className="text-xs text-brown-500">No items yet</p>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {state.items.map((item) => {
                const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
                const lineTotal = (item.price + extrasTotal) * item.quantity;
                return (
                  <li key={item.productId} className="flex items-start gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-cream-200">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full rounded object-cover" />
                      ) : (
                        <ShoppingBag className="h-4 w-4 text-cream-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-brown-900">{item.name}</p>
                      <p className="text-xs text-brown-500">x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium text-brown-900">
                      {formatPrice(lineTotal, currency)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 space-y-1.5 border-t border-cream-200 pt-3 text-xs">
              <div className="flex justify-between text-brown-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-brown-600">
                <span>Tax (8.25%)</span>
                <span>{formatPrice(tax, currency)}</span>
              </div>
              <div className="flex justify-between text-brown-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost, currency)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success-500">
                  <span>Discount</span>
                  <span>-{formatPrice(discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-cream-200 pt-2 text-sm font-semibold text-brown-900">
                <span>Total</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
