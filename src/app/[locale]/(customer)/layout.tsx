"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  LayoutDashboard,
  User,
  ClipboardList,
  MapPin,
  Heart,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Avatar, getInitials, Badge } from "@/components/ui";
import { Navbar, Footer } from "@/components/layout";

const sidebarLinks = [
  { href: "/account", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/account/profile", icon: User, labelKey: "myProfile" },
  { href: "/account/orders", icon: ClipboardList, labelKey: "orderHistory" },
  { href: "/account/addresses", icon: MapPin, labelKey: "addresses" },
  { href: "/account/favorites", icon: Heart, labelKey: "favorites" },
  { href: "/account/reservations", icon: CalendarDays, labelKey: "reservations" },
  { href: "/account/settings", icon: Settings, labelKey: "settings" },
] as const;

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const ct = useTranslations("customer");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // TODO: Get user data from session
  const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  };

  function isActive(href: string) {
    const cleanPath = pathname.replace(/^\/(en|es)/, "");
    if (href === "/account") return cleanPath === "/account";
    return cleanPath.startsWith(href);
  }

  return (
    <>
      <Navbar
        user={user}
        cartCount={0}
      />
      <div className="mx-auto flex min-h-screen max-w-7xl gap-0 px-4 py-6 sm:px-6 lg:gap-8 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-cream-200 bg-white p-5">
            {/* User info */}
            <div className="mb-5 flex items-center gap-3 border-b border-cream-200 pb-5">
              <Avatar
                initials={getInitials(user.firstName, user.lastName)}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brown-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-brown-500">{user.email}</p>
                <Badge variant="active" className="mt-1">
                  {ct("goldMember")}
                </Badge>
              </div>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-terracotta-500/10 text-terracotta-500"
                        : "text-brown-600 hover:bg-cream-200 hover:text-brown-900"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {t(link.labelKey)}
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-error-500 transition-colors hover:bg-error-500/10"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            </nav>
          </div>
        </aside>

        {/* Mobile nav toggle */}
        <div className="fixed bottom-4 right-4 z-40 lg:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-lg"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}>
            <div
              className="absolute bottom-20 right-4 w-64 rounded-xl border border-cream-200 bg-white p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-terracotta-500/10 text-terracotta-500"
                          : "text-brown-600 hover:bg-cream-200"
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {t(link.labelKey)}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <Footer />
    </>
  );
}
