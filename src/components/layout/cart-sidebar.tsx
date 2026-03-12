"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useCart } from "@/lib/cart/cart-context";
import { useBrand, formatPrice } from "@/lib/brand/brand-context";
import { TX_TAX_RATE } from "@/lib/constants";
import { toast } from "sonner";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const t = useTranslations("cart");
  const { currency } = useBrand();
  const {
    state,
    removeItem,
    updateQuantity,
    applyPromo,
    removePromo,
    subtotal,
    itemCount,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");

  const tax = subtotal * TX_TAX_RATE;
  const discount = state.promoDiscount;
  const total = subtotal + tax - discount;

  function handleApplyPromo() {
    if (!promoInput.trim()) return;
    // TODO: Validate promo code against API
    if (promoInput.toUpperCase() === "MANGO10") {
      const discountAmount = subtotal * 0.1;
      applyPromo(promoInput.toUpperCase(), discountAmount);
      toast.success("Promo code applied! 10% off.");
    } else {
      toast.error("Invalid promo code.");
    }
    setPromoInput("");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-brown-900">
                <ShoppingBag className="h-5 w-5 text-terracotta-500" />
                {t("title")}
                {itemCount > 0 && (
                  <span className="rounded-full bg-terracotta-500 px-2 py-0.5 text-xs font-medium text-white">
                    {itemCount}
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-brown-500 transition-colors hover:bg-cream-200 hover:text-brown-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="mb-4 h-16 w-16 text-cream-400" />
                  <p className="text-sm text-brown-500">{t("empty")}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 text-sm font-medium text-terracotta-500 hover:text-terracotta-600"
                  >
                    {t("continueShopping")}
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {state.items.map((item) => {
                    const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
                    const lineTotal = (item.price + extrasTotal) * item.quantity;

                    return (
                      <li
                        key={item.productId}
                        className="flex gap-3 rounded-lg border border-cream-200 p-3"
                      >
                        {/* Image placeholder */}
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-cream-200">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-cream-400">
                              <ShoppingBag className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-brown-900">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-brown-400 transition-colors hover:text-error-500"
                              title={t("remove")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Modifiers */}
                          {item.modifiers.length > 0 && (
                            <p className="text-xs text-brown-500">
                              {item.modifiers.join(", ")}
                            </p>
                          )}

                          {/* Extras */}
                          {item.extras.length > 0 && (
                            <p className="text-xs text-brown-500">
                              + {item.extras.map((e) => e.name).join(", ")}
                            </p>
                          )}

                          <div className="mt-auto flex items-center justify-between pt-2">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-1.5 rounded-full border border-cream-300">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity - 1)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-full text-brown-600 transition-colors hover:bg-cream-200"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-[1.25rem] text-center text-sm font-medium text-brown-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity + 1)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-full text-brown-600 transition-colors hover:bg-cream-200"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <span className="text-sm font-semibold text-terracotta-500">
                              {formatPrice(lineTotal, currency)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer - Promo + Totals + CTA */}
            {state.items.length > 0 && (
              <div className="border-t border-cream-200 px-6 py-4">
                {/* Promo code */}
                {state.promoCode ? (
                  <div className="mb-3 flex items-center justify-between rounded-md bg-success-500/10 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-success-500">
                      <Tag className="h-4 w-4" />
                      <span className="font-medium">{state.promoCode}</span>
                      <span>-{formatPrice(discount, currency)}</span>
                    </div>
                    <button
                      onClick={removePromo}
                      className="text-brown-400 hover:text-error-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mb-3 flex gap-2">
                    <Input
                      placeholder={t("promoCode")}
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleApplyPromo}
                    >
                      {t("apply")}
                    </Button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-brown-600">
                    <span>{t("subtotal")}</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-brown-600">
                    <span>{t("tax")}</span>
                    <span>{formatPrice(tax, currency)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success-500">
                      <span>Discount</span>
                      <span>-{formatPrice(discount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-cream-200 pt-2 text-base font-semibold text-brown-900">
                    <span>{t("total")}</span>
                    <span>{formatPrice(total, currency)}</span>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="mt-4 space-y-2">
                  <Link href="/checkout" onClick={onClose}>
                    <Button variant="primary" size="lg" className="w-full gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      {t("checkout")}
                    </Button>
                  </Link>
                  <button
                    onClick={onClose}
                    className="block w-full text-center text-sm font-medium text-terracotta-500 hover:text-terracotta-600"
                  >
                    {t("continueShopping")}
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
