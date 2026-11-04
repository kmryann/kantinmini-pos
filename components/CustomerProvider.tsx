"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { KANTIN_DATA } from "@/lib/data";
import {
  readCart,
  writeCart,
  resolveContextFromLocation,
  saveContext,
  type CartLine,
  type OrderContext,
} from "@/lib/customer-storage";

type CustomerContextValue = {
  cart: CartLine[];
  context: OrderContext;
  ready: boolean;
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (line: Omit<CartLine, "lineId">) => void;
  updateLine: (lineId: string, patch: Partial<CartLine>) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  setContext: (context: OrderContext) => void;
};

const CustomerContext = createContext<CustomerContextValue | null>(null);

const signature = (line: Omit<CartLine, "lineId"> | CartLine) =>
  JSON.stringify({
    menuId: line.menuId,
    options: [...(line.options || [])].sort(),
    note: (line.note || "").trim().toLowerCase(),
  });

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [context, setContextState] = useState<OrderContext>({ type: "dine-in", table: 3 });
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setCart(readCart());
    const next = resolveContextFromLocation();
    setContextState(next);
    saveContext(next);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeCart(cart);
  }, [cart, ready]);

  const addToCart = useCallback((line: Omit<CartLine, "lineId">) => {
    setCart((current) => {
      const target = signature(line);
      const existing = current.find((entry) => signature(entry) === target);
      if (existing) {
        return current.map((entry) =>
          entry.lineId === existing.lineId ? { ...entry, qty: entry.qty + line.qty } : entry,
        );
      }
      return [
        {
          ...line,
          lineId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        },
        ...current,
      ];
    });
  }, []);

  const updateLine = useCallback((lineId: string, patch: Partial<CartLine>) => {
    setCart((current) =>
      current.map((line) => (line.lineId === lineId ? { ...line, ...patch } : line)),
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setCart((current) => current.filter((line) => line.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const setContext = useCallback((next: OrderContext) => {
    setContextState(next);
    saveContext(next);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + Number(line.qty || 0), 0),
    [cart],
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const menu = KANTIN_DATA.menuById(line.menuId);
        const price = Number(line.price ?? menu?.price ?? 0);
        return sum + price * Number(line.qty || 0);
      }, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      context,
      ready,
      cartCount,
      cartTotal,
      cartOpen,
      openCart,
      closeCart,
      addToCart,
      updateLine,
      removeLine,
      clearCart,
      setContext,
    }),
    [cart, context, ready, cartCount, cartTotal, cartOpen, openCart, closeCart, addToCart, updateLine, removeLine, clearCart, setContext],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const value = useContext(CustomerContext);
  if (!value) throw new Error("useCustomer must be used inside CustomerProvider");
  return value;
}
