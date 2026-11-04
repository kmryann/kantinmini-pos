export type Lang = "id" | "en";

export type Localized = {
  id: string;
  en: string;
};

export type Role = "cashier" | "manager" | "admin";

export type Category = {
  id: string;
  name: Localized;
  icon: string;
  sortOrder: number;
};

export type MenuChoice = {
  id: string;
  label: Localized;
};

export type MenuOptionGroup = {
  id: string;
  label: Localized;
  required: boolean;
  choices: MenuChoice[];
};

export type MenuItem = {
  id: string;
  category: string;
  name: Localized;
  desc: Localized;
  price: number;
  image: string;
  available: boolean;
  popular: boolean;
  sortOrder: number;
  options: MenuOptionGroup[];
};

export type MenuPayload = {
  categories: Category[];
  menu: MenuItem[];
};

export type OrderItem = {
  menuId: string;
  qty: number;
  options: string[];
  note: string;
  name: Localized;
  price: number;
  optionLabels: Localized[];
};

export type PaymentMethod = "QRIS" | "Cash";
export type PaymentStatus = "pending" | "paid" | "expired" | "cancelled";
export type OrderStatus = "new" | "cooking" | "ready" | "cancelled";
export type OrderSource = "QR" | "POS";
export type OrderType = "dine-in" | "takeaway";

export type Order = {
  id: string;
  code: string;
  customer: string;
  type: OrderType;
  table: number | null;
  items: OrderItem[];
  total: number;
  payment: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  source: OrderSource;
  createdAt: string;
  paidAt: string | null;
  expiresAt: string | null;
  paymentCode: string | null;
  paymentReference: string | null;
  qrUrl: string | null;
  publicToken?: string;
};

export type CreateOrderInput = {
  customer: string;
  type: OrderType;
  table?: number | null;
  items: { menuId: string; qty: number; options?: string[]; note?: string }[];
  payment: PaymentMethod;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

export type StaffAccount = SessionUser & {
  lastLoginAt: string | null;
  createdAt: string;
};

export type AppSettings = {
  name: string;
  tagline: string;
  address: string;
  hours: string;
  description: string;
  logo: string;
  receiptWidth: "58" | "80";
  autoKitchen: boolean;
  autoCustomer: boolean;
  midtransEnvironment: "sandbox" | "production";
  midtransClientKey: string;
  midtransServerKey: string;
  midtransWebhook: string;
};

export type PublicSettings = Pick<AppSettings, "name" | "tagline" | "address" | "hours" | "description" | "logo"> & {
  midtransConfigured: boolean;
};

export type ReportStats = {
  revenue: number;
  transactions: number;
  average: number;
  items: number;
};

export type ReportPoint = {
  label: Localized;
  value: number;
  date: string;
};

export type ReportTopMenu = {
  menuId: string;
  name: Localized;
  image: string;
  count: number;
};

export type ReportSummary = {
  from: string;
  to: string;
  stats: ReportStats;
  trends: {
    revenue: number;
    transactions: number;
    average: number;
    items: number;
  };
  series: ReportPoint[];
  hourly: { hour: string; value: number; revenue: number }[];
  paymentMix: { qris: number; cash: number };
  topMenus: ReportTopMenu[];
  transactions: Order[];
};

export type DashboardData = {
  period: "today" | "week" | "month";
  from: string;
  to: string;
  stats: ReportStats;
  trends: ReportSummary["trends"];
  series: ReportPoint[];
  hourly: ReportSummary["hourly"];
  paymentMix: ReportSummary["paymentMix"];
  topMenus: ReportTopMenu[];
  recentOrders: Order[];
};
