export type Role = "cashier" | "manager" | "admin";

export type StaffNavItem = {
  page: string;
  href: string;
  label: string;
  icon: string;
  roles: Role[];
};

export const roleUsers = {
  cashier: { name: "Rina Kartika", short: "Rina", initials: "RK" },
  manager: { name: "Budi Santoso", short: "Budi", initials: "BS" },
  admin: { name: "Sari Wulandari", short: "Sari", initials: "SW" },
} as const;

export const navConfig: { key: string; items: StaffNavItem[] }[] = [
  {
    key: "nav.workspace",
    items: [
      { page: "pos", href: "/pos", label: "nav.pos", icon: "layout", roles: ["cashier", "admin"] },
      { page: "orders", href: "/orders", label: "nav.orders", icon: "receipt", roles: ["cashier", "admin"] },
      { page: "today", href: "/cashier-report", label: "nav.today", icon: "chart", roles: ["cashier", "admin"] },
    ],
  },
  {
    key: "nav.insights",
    items: [
      { page: "dashboard", href: "/dashboard", label: "nav.dashboard", icon: "layout", roles: ["manager", "admin"] },
      { page: "reports", href: "/reports", label: "nav.reports", icon: "chart", roles: ["manager", "admin"] },
    ],
  },
  {
    key: "nav.manage",
    items: [
      { page: "menus", href: "/menus", label: "nav.menus", icon: "tag", roles: ["manager", "admin"] },
    ],
  },
  {
    key: "nav.admin",
    items: [
      { page: "accounts", href: "/accounts", label: "nav.accounts", icon: "users", roles: ["admin"] },
      { page: "settings", href: "/settings", label: "nav.settings", icon: "settings", roles: ["admin"] },
    ],
  },
];

export const pageTitles: Record<string, { id: string; en: string }> = {
  "/pos": { id: "POS", en: "POS" },
  "/orders": { id: "Pesanan & pembayaran", en: "Orders & payments" },
  "/cashier-report": { id: "Laporan hari ini", en: "Today's report" },
  "/dashboard": { id: "Dashboard", en: "Dashboard" },
  "/reports": { id: "Laporan transaksi", en: "Transactions report" },
  "/menus": { id: "Menu & kategori", en: "Menu & categories" },
  "/accounts": { id: "Akun staf", en: "Staff accounts" },
  "/settings": { id: "Pengaturan", en: "Settings" },
};

export const allowedPages: Record<string, Role[]> = {
  "/pos": ["cashier", "admin"],
  "/orders": ["cashier", "admin"],
  "/cashier-report": ["cashier", "admin"],
  "/dashboard": ["manager", "admin"],
  "/reports": ["manager", "admin"],
  "/menus": ["manager", "admin"],
  "/accounts": ["admin"],
  "/settings": ["admin"],
};

const defaultRoles: Record<string, Role> = {
  "/pos": "cashier",
  "/orders": "cashier",
  "/cashier-report": "cashier",
  "/dashboard": "manager",
  "/reports": "manager",
  "/menus": "manager",
  "/accounts": "admin",
  "/settings": "admin",
};

export function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function defaultRoleForPath(pathname: string): Role {
  return defaultRoles[normalizePath(pathname)] ?? "cashier";
}

export function homeForRole(role: Role) {
  if (role === "admin") return "/settings";
  if (role === "manager") return "/dashboard";
  return "/pos";
}

export function isRole(value: string | null): value is Role {
  return value === "cashier" || value === "manager" || value === "admin";
}
