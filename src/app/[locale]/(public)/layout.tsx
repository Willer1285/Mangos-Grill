"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar, Footer, CartSidebar } from "@/components/layout";
import { useCart } from "@/lib/cart/cart-context";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();
  const { data: session } = useSession();

  const user = session?.user
    ? {
        firstName: session.user.firstName || session.user.name?.split(" ")[0] || "",
        lastName: session.user.lastName || session.user.name?.split(" ").slice(1).join(" ") || "",
        email: session.user.email || "",
        avatar: session.user.image || null,
      }
    : null;

  return (
    <>
      <Navbar user={user} cartCount={itemCount} onCartClick={() => setCartOpen(true)} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
