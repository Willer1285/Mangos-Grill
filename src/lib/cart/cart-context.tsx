"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CartExtra {
  name: string;
  price: number;
}

export interface CartItem {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  modifiers: string[];
  extras: CartExtra[];
}

export interface CartState {
  items: CartItem[];
  promoCode: string;
  promoDiscount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "APPLY_PROMO"; payload: { code: string; discount: number } }
  | { type: "REMOVE_PROMO" }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; payload: CartState };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function itemKey(item: CartItem): string {
  return `${item.productId}_${item.modifiers.sort().join(",")}_${item.extras
    .map((e) => e.name)
    .sort()
    .join(",")}`;
}

const STORAGE_KEY = "mangos_cart";
const CART_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

interface PersistedCart {
  state: CartState;
  updatedAt: number;
}

function persist(state: CartState) {
  try {
    const data: PersistedCart = { state, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* SSR or quota exceeded */
  }
}

function loadCart(): CartState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Support new format with expiry
    if (parsed.updatedAt && parsed.state) {
      const elapsed = Date.now() - parsed.updatedAt;
      if (elapsed > CART_EXPIRY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null; // Cart expired
      }
      return parsed.state as CartState;
    }

    // Legacy format (plain CartState)
    return parsed as CartState;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Reducer                                                            */
/* ------------------------------------------------------------------ */

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const incoming = action.payload;
      const key = itemKey(incoming);
      const exists = state.items.findIndex((i) => itemKey(i) === key);

      let newItems: CartItem[];
      if (exists >= 0) {
        newItems = state.items.map((item, idx) =>
          idx === exists
            ? { ...item, quantity: item.quantity + incoming.quantity }
            : item
        );
      } else {
        newItems = [...state.items, incoming];
      }
      return { ...state, items: newItems };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.productId !== productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      };
    }

    case "APPLY_PROMO":
      return {
        ...state,
        promoCode: action.payload.code,
        promoDiscount: action.payload.discount,
      };

    case "REMOVE_PROMO":
      return { ...state, promoCode: "", promoDiscount: 0 };

    case "CLEAR_CART":
      return { items: [], promoCode: "", promoDiscount: 0 };

    case "HYDRATE":
      return action.payload;

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const initialState: CartState = {
  items: [],
  promoCode: "",
  promoDiscount: 0,
};

interface CartContextValue {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyPromo: (code: string, discount: number) => void;
  removePromo: () => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  /* Hydrate from localStorage on mount (auto-clears if older than 2 hours) */
  useEffect(() => {
    const saved = loadCart();
    if (saved && saved.items.length > 0) {
      dispatch({ type: "HYDRATE", payload: saved });
    }
  }, []);

  /* Persist on every change (skip initial mount) */
  useEffect(() => {
    persist(state);
  }, [state]);

  const addItem = useCallback(
    (item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item }),
    []
  );

  const removeItem = useCallback(
    (productId: string) => dispatch({ type: "REMOVE_ITEM", payload: productId }),
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } }),
    []
  );

  const applyPromo = useCallback(
    (code: string, discount: number) =>
      dispatch({ type: "APPLY_PROMO", payload: { code, discount } }),
    []
  );

  const removePromo = useCallback(
    () => dispatch({ type: "REMOVE_PROMO" }),
    []
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

  const itemCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  const subtotal = useMemo(
    () =>
      state.items.reduce((sum, item) => {
        const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
        return sum + (item.price + extrasTotal) * item.quantity;
      }, 0),
    [state.items]
  );

  const value = useMemo(
    () => ({
      state,
      addItem,
      removeItem,
      updateQuantity,
      applyPromo,
      removePromo,
      clearCart,
      itemCount,
      subtotal,
    }),
    [state, addItem, removeItem, updateQuantity, applyPromo, removePromo, clearCart, itemCount, subtotal]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
