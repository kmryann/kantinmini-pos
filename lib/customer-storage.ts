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
export const CART_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam

type StoredCart = {
  items: CartLine[];
  updatedAt: number;
};

export function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const value = JSON.parse(raw) as CartLine[] | StoredCart;
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.items)) {
      const updatedAt = Number(value.updatedAt || 0);
      if (updatedAt > 0 && Date.now() - updatedAt > CART_TTL_MS) {
        localStorage.removeItem(CART_KEY);
        return [];
      }
      return value.items;
    }
    return [];
  } catch {
    return [];
  }
}

export function writeCart(cart: CartLine[]) {
  try {
    if (!cart.length) {
      localStorage.removeItem(CART_KEY);
      return;
    }
    const payload: StoredCart = { items: cart, updatedAt: Date.now() };
    localStorage.setItem(CART_KEY, JSON.stringify(payload));
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
  return readContext() || { type: "dine-in", table: null };
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

export type WhatsAppOrderLine = {
  menuId: string;
  name: { id: string; en: string };
  qty: number;
  price: number;
  optionsLabel: string;
  note: string;
};

export type WhatsAppOrderSnapshot = {
  reference: string;
  customer: string;
  type: "dine-in" | "takeaway";
  time: string;
  payment: "QRIS" | "Cash";
  paymentClaimed: boolean;
  note: string;
  total: number;
  items: WhatsAppOrderLine[];
  createdAt: string;
  waUrl: string;
};

export const WHATSAPP_ORDER_KEY = "kantin-wa-order";

export function readWhatsAppOrder(): WhatsAppOrderSnapshot | null {
  try {
    const value = JSON.parse(localStorage.getItem(WHATSAPP_ORDER_KEY) || "null");
    return value && value.reference && value.waUrl ? value : null;
  } catch {
    return null;
  }
}

export function saveWhatsAppOrder(order: WhatsAppOrderSnapshot) {
  try {
    localStorage.setItem(WHATSAPP_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Storage may be unavailable.
  }
}

export function createWhatsAppReference() {
  return `WA-${String(Date.now()).slice(-6)}`;
}
