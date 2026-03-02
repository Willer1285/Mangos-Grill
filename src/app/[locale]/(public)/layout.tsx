"use client";

import { useState } from "react";
import { Navbar, Footer, CartSidebar } from "@/components/layout";
import { useCart } from "@/lib/cart/cart-context";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <Navbar cartCount={itemCount} onCartClick={() => setCartOpen(true)} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
