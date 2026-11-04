import type {
  AppSettings,
  Category,
  CreateOrderInput,
  DashboardData,
  MenuItem,
  MenuPayload,
  Order,
  PublicSettings,
  ReportSummary,
  Role,
  SessionUser,
  StaffAccount,
} from "@/lib/api-types";

export class ApiClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new ApiClientError(response.status, data?.error || "Permintaan gagal.");
  }
  return data as T;
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  menu: () => request<MenuPayload>("/api/menu"),
  settings: () => request<PublicSettings>("/api/settings"),
  createOrder: (input: CreateOrderInput) =>
    request<Order>("/api/orders", json("POST", input)),
  customerOrder: (token: string) => request<Order>(`/api/orders/${token}`),
  simulatePayment: (token: string) =>
    request<Order>(`/api/orders/${token}/pay`, json("POST")),
  session: () => request<{ user: SessionUser | null }>("/api/auth/session"),
  login: (email: string, password: string) =>
    request<SessionUser>("/api/auth/login", json("POST", { email, password })),
  demoLogin: (role: Role) => request<SessionUser>("/api/auth/demo", json("POST", { role })),
  logout: () => request<{ ok: true }>("/api/auth/logout", json("POST")),
  staffOrders: () => request<Order[]>("/api/staff/orders"),
  createPosOrder: (input: CreateOrderInput) =>
    request<Order>("/api/staff/orders", json("POST", input)),
  updateOrder: (id: string, action: string) =>
    request<Order>(`/api/staff/orders/${id}`, json("PATCH", { action })),
  dashboard: (period: "today" | "week" | "month") =>
    request<DashboardData>(`/api/staff/dashboard?period=${period}`),
  reports: (params: { from?: string; to?: string; period?: string }) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value && search.set(key, value));
    return request<ReportSummary>(`/api/staff/reports?${search.toString()}`);
  },
  accounts: () => request<StaffAccount[]>("/api/staff/accounts"),
  createAccount: (input: { name: string; email: string; role: Role; active: boolean; password: string }) =>
    request<StaffAccount>("/api/staff/accounts", json("POST", input)),
  updateAccount: (id: string, input: Partial<{ name: string; email: string; role: Role; active: boolean; password: string }>) =>
    request<StaffAccount>(`/api/staff/accounts/${id}`, json("PATCH", input)),
  printSettings: () => request<{ name: string; address: string; receiptWidth: "58" | "80"; autoKitchen: boolean; autoCustomer: boolean }>("/api/staff/print-settings"),
  staffSettings: () => request<AppSettings>("/api/staff/settings"),
  updateSettings: (input: Partial<AppSettings>) =>
    request<AppSettings>("/api/staff/settings", json("PATCH", input)),
  createMenu: (input: Partial<MenuItem> & { name: { id: string; en: string }; category: string }) =>
    request<{ id: string } & MenuPayload>("/api/staff/menus", json("POST", input)),
  updateMenu: (id: string, input: Partial<MenuItem>) =>
    request<MenuPayload>(`/api/staff/menus/${id}`, json("PATCH", input)),
  deleteMenu: (id: string) =>
    request<{ ok: true }>(`/api/staff/menus/${id}`, json("DELETE")),
  createCategory: (input: { name: { id: string; en: string }; icon?: string }) =>
    request<{ id: string } & MenuPayload>("/api/staff/categories", json("POST", input)),
  updateCategory: (id: string, input: { name?: { id: string; en: string }; icon?: string; sortOrder?: number }) =>
    request<MenuPayload>(`/api/staff/categories/${id}`, json("PATCH", input)),
  deleteCategory: (id: string) =>
    request<{ ok: true }>(`/api/staff/categories/${id}`, json("DELETE")),
  uploadMenuPhoto: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ url: string }>("/api/staff/uploads", { method: "POST", body: form });
  },
};

export type { Category, MenuItem, MenuPayload, Order };
