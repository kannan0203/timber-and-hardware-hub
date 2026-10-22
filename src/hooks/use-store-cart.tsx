import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type CartEntry = { productId: string; quantity: number };
type StoreContextValue = {
  cart: CartEntry[];
  itemCount: number;
  signedIn: boolean;
  add: (productId: string, quantity?: number, stock?: number | null) => void;
  setQuantity: (productId: string, quantity: number, stock?: number | null) => void;
  remove: (productId: string) => void;
  clear: () => void;
  refreshSession: () => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_STORAGE_KEY = "amman-store-cart-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) {
          setCart(parsed.filter((item): item is CartEntry =>
            !!item && typeof item.productId === "string" && Number.isInteger(item.quantity) && item.quantity > 0,
          ));
        }
      }
    } catch {
      setCart([]);
    }
    void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setSignedIn(Boolean(session?.user));
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const value = useMemo<StoreContextValue>(() => {
    const update = (productId: string, quantity: number, stock?: number | null) => {
      const limited = stock == null ? quantity : Math.min(quantity, stock);
      setCart((current) => limited <= 0
        ? current.filter((item) => item.productId !== productId)
        : current.map((item) => item.productId === productId ? { ...item, quantity: limited } : item));
    };
    return {
      cart,
      itemCount: cart.reduce((total, item) => total + item.quantity, 0),
      signedIn,
      add: (productId, quantity = 1, stock = null) => {
        const existing = cart.find((item) => item.productId === productId);
        update(productId, (existing?.quantity ?? 0) + quantity, stock);
      },
      setQuantity: update,
      remove: (productId) => setCart((current) => current.filter((item) => item.productId !== productId)),
      clear: () => setCart([]),
      refreshSession: async () => {
        const { data } = await supabase.auth.getUser();
        setSignedIn(Boolean(data.user));
      },
    };
  }, [cart, signedIn]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStoreCart() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("Store cart provider is missing.");
  return value;
}