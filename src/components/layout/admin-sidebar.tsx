"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  FolderOpen,
  CreditCard,
  ClipboardList,
  CalendarDays,
  Briefcase,
  MapPin,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Avatar, getInitials } from "@/components/ui";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string | null;
  };
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
];

const bottomItems = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    const cleanPath = pathname.replace(/^\/(en|es)/, "");
    if (href === "/admin") return cleanPath === "/admin";
    return cleanPath.startsWith(href);
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-500 text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12 2C10 6 7 8 7 12c0 2.8 2.2 5 5 5s5-2.2 5-5c0-4-3-6-5-10zm0 13c-1.7 0-3-1.3-3-3 0-1.5.8-2.8 2-4.4.4.5.7 1 1 1.5.3-.5.6-1 1-1.5 1.2 1.6 2 2.9 2 4.4 0 1.7-1.3 3-3 3z" />
          </svg>
        </div>
        <div>
          <span className="text-sm font-semibold text-white">Mango&apos;s Grill</span>
          <p className="text-xs text-cream-400">Admin Panel</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto scrollbar-dark space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-terracotta-500/20 text-terracotta-400"
                : "text-cream-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-brown-800 px-3 py-4">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-terracotta-500/20 text-terracotta-400"
                : "text-cream-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-cream-400 transition-colors hover:bg-white/5 hover:text-white">
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>

      {/* User info */}
      <div className="border-t border-brown-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar
            initials={getInitials(user.firstName, user.lastName)}
            src={user.avatar}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-cream-400">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brown-900 text-white shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle admin sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-brown-900 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
