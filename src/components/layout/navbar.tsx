"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ShoppingBag,
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
import { Button, Avatar, getInitials } from "@/components/ui";
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
import { motion, AnimatePresence } from "framer-motion";

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

/* ── Animated Menu Toggle Button ── */
function MenuToggle({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-brown-700/50 lg:hidden"
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <div className="flex h-5 w-6 flex-col items-center justify-center">
        <motion.span
          className="absolute h-[2px] w-5 rounded-full bg-cream-200"
          animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.span
          className="absolute h-[2px] rounded-full bg-cream-200"
          animate={isOpen ? { width: 0, opacity: 0 } : { width: 12, opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.span
          className="absolute h-[2px] w-5 rounded-full bg-cream-200"
          animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
        />
      </div>
    </button>
  );
}

/* ── Fullscreen Mobile Menu Overlay ── */
function MobileMenuOverlay({
  isOpen,
  onClose,
  navLinks,
  t,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  navLinks: readonly { href: string; labelKey: string }[];
  t: (key: string) => string;
  user?: NavbarProps["user"];
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Glassmorphism background */}
          <motion.div
            className="absolute inset-0 bg-brown-900/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Content slides from top */}
          <motion.nav
            className="relative flex flex-1 flex-col items-center justify-center gap-2 px-8 pt-20"
            initial={{ y: "-30%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-30%", opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.labelKey}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.06,
                  ease: [0.76, 0, 0.24, 1],
                }}
              >
                <Link
                  href={link.href}
                  className="block py-3 text-center text-3xl font-light tracking-wide text-cream-200 transition-colors duration-300 hover:text-terracotta-400 sm:text-4xl"
                  onClick={onClose}
                >
                  {t(link.labelKey)}
                </Link>
              </motion.div>
            ))}

            {/* Decorative separator */}
            <motion.div
              className="my-4 h-px w-16 bg-cream-400/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            />

            {/* Login link in mobile menu for non-authenticated users */}
            {!user && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.35, delay: navLinks.length * 0.06, ease: [0.76, 0, 0.24, 1] }}
              >
                <Link
                  href="/login"
                  className="block py-3 text-center text-xl font-medium tracking-wide text-terracotta-400 transition-colors duration-300 hover:text-terracotta-300"
                  onClick={onClose}
                >
                  {t("login")}
                </Link>
              </motion.div>
            )}
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Navbar({ user, cartCount = 0, notificationCount = 0, onCartClick }: NavbarProps) {
  const t = useTranslations("nav");
  const brand = useBrand();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-brown-700/10 bg-brown-800/95 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center gap-2">
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
          <div className="hidden items-center gap-6 lg:flex">
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

            {/* User menu or Login (desktop only) */}
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
                    <span className="hidden text-sm font-medium text-cream-200 lg:inline">
                      {user.firstName}
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-cream-400 lg:block" />
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
              <Link href="/login" className="hidden lg:block">
                <Button size="sm" className="border border-cream-400/30 bg-transparent text-cream-200 hover:bg-cream-200/10">
                  {t("login")}
                </Button>
              </Link>
            )}

            {/* Animated Menu Toggle (tablet + mobile) */}
            <MenuToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
          </div>
        </nav>
      </header>

      {/* Fullscreen Mobile/Tablet Menu Overlay */}
      <MobileMenuOverlay
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={navLinks}
        t={t}
        user={user}
      />
    </>
  );
}
