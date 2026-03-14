"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<"added" | "removed" | null>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: async () => null,
  loading: false,
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    fetch("/api/account/favorites")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: string[]) => setFavorites(data.map(String)))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [session?.user]);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!session?.user) return null;
      try {
        const res = await fetch("/api/account/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        setFavorites(data.favorites.map(String));
        return data.action as "added" | "removed";
      } catch {
        return null;
      }
    },
    [session?.user]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
