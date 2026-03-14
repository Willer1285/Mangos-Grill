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
import { m, AnimatePresence } from "framer-motion";
import { LazyMotionProvider } from "@/lib/framer-lazy";

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
      <LazyMotionProvider>
        <div className="flex h-5 w-6 flex-col items-center justify-center">
          <m.span
            className="absolute h-[2px] w-5 rounded-full bg-cream-200"
            animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
          />
          <m.span
            className="absolute h-[2px] rounded-full bg-cream-200"
            animate={isOpen ? { width: 0, opacity: 0 } : { width: 12, opacity: 1 }}
            transition={{ duration: 0.25, ease: [0.76, 0, 0.24, 1] }}
          />
          <m.span
            className="absolute h-[2px] w-5 rounded-full bg-cream-200"
            animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
          />
        </div>
      </LazyMotionProvider>
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
    <LazyMotionProvider>
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 z-40 flex flex-col lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Glassmorphism background */}
          <m.div
            className="absolute inset-0 bg-brown-900/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Content slides from top */}
          <m.nav
            className="relative flex flex-1 flex-col items-center justify-center gap-2 px-8 pt-20"
            initial={{ y: "-30%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-30%", opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          >
            {navLinks.map((link, i) => (
              <m.div
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
              </m.div>
            ))}

            {/* Decorative separator */}
            <m.div
              className="my-4 h-px w-16 bg-cream-400/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            />

            {/* Login button in mobile menu for non-authenticated users */}
            {!user && (
              <m.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.35, delay: navLinks.length * 0.06, ease: [0.76, 0, 0.24, 1] }}
              >
                <Link href="/login" onClick={onClose}>
                  <button className="mt-2 rounded-full border-2 border-terracotta-400 px-8 py-2.5 text-lg font-medium tracking-wide text-terracotta-400 transition-colors duration-300 hover:bg-terracotta-400 hover:text-white">
                    {t("login")}
                  </button>
                </Link>
              </m.div>
            )}

            {/* Social icons */}
            <m.div
              className="mt-4 flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: (navLinks.length + 1) * 0.06 }}
            >
              {[
                { name: "Instagram", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                { name: "Facebook", d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                { name: "Twitter", d: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" },
                { name: "YouTube", d: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="text-cream-400/60 transition-colors hover:text-terracotta-400"
                  aria-label={social.name}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.d} />
                  </svg>
                </a>
              ))}
            </m.div>
          </m.nav>
        </m.div>
      )}
    </AnimatePresence>
    </LazyMotionProvider>
  );
}

export function Navbar({ user, cartCount = 0, notificationCount = 0, onCartClick }: NavbarProps) {
  const t = useTranslations("nav");
  const brand = useBrand();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className={cn("sticky top-0 w-full border-b border-brown-700/10 bg-brown-800/95 backdrop-blur-md", mobileOpen ? "z-50" : "z-40")}>
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
            <button
              className="relative rounded-lg bg-terracotta-500 p-2 text-white shadow-sm transition-colors hover:bg-terracotta-600"
              onClick={onCartClick}
              aria-label={t("cart")}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold leading-none text-white shadow-sm">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

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
