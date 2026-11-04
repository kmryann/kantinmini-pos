export type CartLine = {
  lineId: string;
  menuId: string;
  qty: number;
  options: string[];
  note: string;
};

export type OrderContext = {
  type: "dine-in" | "takeaway";
  table: number | null;
};

export type ActiveOrder = {
  code: string;
  customer: string;
  type: "dine-in" | "takeaway";
  table: number | null;
  items: { menuId: string; qty: number; options: string[]; note: string }[];
  total: number;
  payment: "QRIS" | "Cash";
  paymentStatus: "pending" | "paid" | "expired" | "cancelled";
  orderStatus: "new" | "cooking" | "ready" | "cancelled";
  source: "QR" | "POS";
  createdAt: string;
  expiresAt: string;
  paidAt?: string | null;
  paymentCode?: string | null;
};

export const CART_KEY = "kantin-cart";
export const CONTEXT_KEY = "kantin-context";
export const ORDER_KEY = "kantin-active-order";

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

export function readActiveOrder(): ActiveOrder | null {
  try {
    const value = JSON.parse(localStorage.getItem(ORDER_KEY) || "null");
    return value && value.code ? value : null;
  } catch {
    return null;
  }
}

export function saveActiveOrder(order: ActiveOrder) {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch {
    // Storage may be unavailable.
  }
}

export function clearActiveOrder() {
  try {
    localStorage.removeItem(ORDER_KEY);
  } catch {
    // Storage may be unavailable.
  }
}

export function createOrderCode() {
  return `A-${Math.floor(100 + Math.random() * 900)}`;
}

export function createPaymentCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}
