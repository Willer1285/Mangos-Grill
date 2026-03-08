"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useTranslations } from "next-intl";
import {
  Bell,
  CheckCircle,
  Tag,
  CalendarDays,
  Star,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "order" | "promo" | "reservation" | "review" | "delivery";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const typeIcons = {
  order: CheckCircle,
  promo: Tag,
  reservation: CalendarDays,
  review: Star,
  delivery: Package,
};

const typeColors = {
  order: "text-success-500",
  promo: "text-terracotta-500",
  reservation: "text-info-500",
  review: "text-gold-500",
  delivery: "text-brown-600",
};

interface NotificationsPopoverProps {
  count?: number;
  notifications?: Notification[];
}

export function NotificationsPopover({
  count = 0,
  notifications = [],
}: NotificationsPopoverProps) {
  const t = useTranslations("nav");

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-cream-300 transition-colors hover:bg-brown-700"
          aria-label={t("notifications")}
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta-500 text-[10px] font-bold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 w-80 overflow-hidden rounded-xl border border-cream-300 bg-white shadow-xl",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cream-300 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-brown-900">{t("notifications")}</h3>
              {count > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-terracotta-500 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </div>
            <button className="text-xs font-medium text-terracotta-500 hover:text-terracotta-600">
              {t("markAllRead")}
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-brown-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 border-b border-cream-200 px-4 py-3 transition-colors hover:bg-cream-50",
                      !notification.read && "bg-cream-50"
                    )}
                  >
                    <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", typeColors[notification.type])} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-brown-900">{notification.title}</p>
                      <p className="mt-0.5 text-xs text-brown-600 line-clamp-2">{notification.message}</p>
                      <p className="mt-1 text-xs text-terracotta-500">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-terracotta-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-cream-300 px-4 py-2.5 text-center">
              <button className="text-xs font-medium text-terracotta-500 hover:text-terracotta-600">
                View All Notifications &rarr;
              </button>
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
