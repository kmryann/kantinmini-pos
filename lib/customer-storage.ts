export type CartLine = {
  lineId: string;
  menuId: string;
  qty: number;
  options: string[];
  note: string;
  name?: { id: string; en: string };
  image?: string;
  price?: number;
  optionLabels?: { id: string; en: string }[];
};

export type OrderContext = {
  type: "dine-in" | "takeaway";
  table: number | null;
};

export const CART_KEY = "kantin-cart";
export const CONTEXT_KEY = "kantin-context";

export function readCart(): CartLine[] {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeCart(cart: CartLine[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Storage may be unavailable.
  }
}

export function readContext(): OrderContext | null {
  try {
    return JSON.parse(localStorage.getItem(CONTEXT_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveContext(context: OrderContext) {
  try {
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  } catch {
    // Storage may be unavailable.
  }
}

export function resolveContextFromLocation(): OrderContext {
  const params = new URLSearchParams(window.location.search);
  const table = params.get("table");
  const type = params.get("type");
  if (type === "takeaway") return { type: "takeaway", table: null };
  if (table) return { type: "dine-in", table: Number(table) || 1 };
  return readContext() || { type: "dine-in", table: 3 };
}

export type ActiveOrderRef = {
  id: string;
  code: string;
  token: string;
};

export const ACTIVE_ORDER_REF_KEY = "kantin-active-order-ref";

export function readActiveOrderRef(): ActiveOrderRef | null {
  try {
    const value = JSON.parse(localStorage.getItem(ACTIVE_ORDER_REF_KEY) || "null");
    return value && value.token ? value : null;
  } catch {
    return null;
  }
}

export function saveActiveOrderRef(order: ActiveOrderRef) {
  try {
    localStorage.setItem(ACTIVE_ORDER_REF_KEY, JSON.stringify(order));
  } catch {
    // Storage may be unavailable.
  }
}

export function clearActiveOrderRef() {
  try {
    localStorage.removeItem(ACTIVE_ORDER_REF_KEY);
  } catch {
    // Storage may be unavailable.
  }
}
