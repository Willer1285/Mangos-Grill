"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ShoppingBag,
  Bell,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  User,
  ClipboardList,
  Heart,
  CalendarDays,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";
import { Button, Avatar, getInitials, Badge } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useBrand } from "@/lib/brand/brand-context";
import Image from "next/image";
import { NotificationsPopover } from "./notifications-popover";
import { LanguageSwitcher } from "./language-switcher";

interface NavbarProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
  } | null;
  cartCount?: number;
  notificationCount?: number;
  onCartClick?: () => void;
}

const navLinks = [
  { href: "/", labelKey: "home" },
  { href: "/menu", labelKey: "menu" },
  { href: "/locations", labelKey: "locations" },
  { href: "/reservations", labelKey: "reservations" },
  { href: "/jobs", labelKey: "jobs" },
  { href: "/contact", labelKey: "contact" },
] as const;

export function Navbar({ user, cartCount = 0, notificationCount = 0, onCartClick }: NavbarProps) {
  const t = useTranslations("nav");
  const brand = useBrand();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brown-700/10 bg-brown-800/95 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {brand.loaded && (brand.displayMode === "logo" || brand.displayMode === "both") && (brand.logoDark || brand.logo) && (
            <div className="relative shrink-0" style={{ height: brand.logoSize, width: brand.logoSize }}>
              <Image src={brand.logoDark || brand.logo!} alt={brand.brandName} fill className="object-contain" />
            </div>
          )}
          {brand.loaded && (brand.displayMode === "text" || brand.displayMode === "both") && (
            <span className="text-lg font-semibold text-cream-100">{brand.brandName}</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.labelKey}
              href={link.href}
              className="text-sm font-medium text-cream-300 transition-colors hover:text-terracotta-400"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* Notifications (logged in only) */}
          {user && (
            <NotificationsPopover count={notificationCount} />
          )}

          {/* Cart */}
          <Button size="sm" className="relative gap-1.5 bg-terracotta-500 text-white shadow-sm hover:bg-terracotta-600" onClick={onCartClick}>
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{t("cart")}</span>
            {cartCount > 0 && (
              <span className="ml-0.5">({cartCount})</span>
            )}
          </Button>

          {/* User menu or Login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-brown-700">
                  <Avatar
                    initials={getInitials(user.firstName, user.lastName)}
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    size="sm"
                  />
                  <span className="hidden text-sm font-medium text-cream-200 md:inline">
                    {user.firstName}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-cream-400 md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-brown-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-brown-500">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex cursor-pointer items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {t("dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/profile" className="flex cursor-pointer items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("myProfile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders" className="flex cursor-pointer items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    {t("orderHistory")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/favorites" className="flex cursor-pointer items-center gap-2">
                    <Heart className="h-4 w-4" />
                    {t("favorites")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/reservations" className="flex cursor-pointer items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {t("reservations")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/addresses" className="flex cursor-pointer items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t("addresses")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/settings" className="flex cursor-pointer items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {t("settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive className="gap-2" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="border border-cream-400/30 bg-transparent text-cream-200 hover:bg-cream-200/10">
                {t("login")}
              </Button>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-cream-300 hover:bg-brown-700 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-brown-700 bg-brown-800 md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.labelKey}
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-cream-300 hover:bg-brown-700 hover:text-terracotta-400"
                onClick={() => setMobileOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
