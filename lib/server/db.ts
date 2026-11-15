import path from "node:path";
import os from "node:os";
import { mkdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { KANTIN_DATA } from "@/lib/data";
import type { AppSettings, Localized, OrderItem, OrderSource, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/api-types";
import { createPaymentCode, createToken, hashPassword } from "@/lib/server/crypto";

type DbGlobal = typeof globalThis & {
  __kantinDbPromise?: Promise<PGlite>;
};

const globalForDb = globalThis as DbGlobal;

const schema = `
  create table if not exists categories (
    id text primary key,
    name_id text not null,
    name_en text not null,
    icon text not null default 'utensils',
    sort_order integer not null default 0
  );

  create table if not exists menus (
    id text primary key,
    category_id text not null references categories(id),
    name_id text not null,
    name_en text not null,
    desc_id text not null default '',
    desc_en text not null default '',
    price integer not null check (price >= 0),
    image text not null default '/assets/menu/placeholder.webp',
    available boolean not null default true,
    popular boolean not null default false,
    sort_order integer not null default 0,
    options jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create sequence if not exists order_code_seq start 101;

  create table if not exists orders (
    id text primary key,
    code text not null unique,
    public_token text,
    customer text not null,
    type text not null check (type in ('dine-in', 'takeaway')),
    table_no integer,
    items jsonb not null,
    total integer not null,
    payment text not null check (payment in ('QRIS', 'Cash')),
    payment_status text not null check (payment_status in ('pending', 'paid', 'expired', 'cancelled')),
    order_status text not null check (order_status in ('new', 'cooking', 'ready', 'cancelled')),
    source text not null check (source in ('QR', 'POS')),
    payment_code text,
    payment_reference text,
    qr_url text,
    note text,
    fulfillment_time text,
    created_at timestamptz not null default now(),
    paid_at timestamptz,
    expires_at timestamptz,
    updated_at timestamptz not null default now()
  );

  alter table orders add column if not exists note text;
  alter table orders add column if not exists fulfillment_time text;
  create index if not exists orders_created_idx on orders (created_at desc);
  create index if not exists orders_payment_status_idx on orders (payment_status);
  create index if not exists orders_public_token_idx on orders (public_token);

  create table if not exists staff_accounts (
    id text primary key,
    name text not null,
    email text not null unique,
    role text not null check (role in ('cashier', 'manager', 'admin')),
    active boolean not null default true,
    password_hash text not null,
    last_login_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table if not exists sessions (
    id text primary key,
    token_hash text not null unique,
    account_id text not null references staff_accounts(id) on delete cascade,
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
  );

  create index if not exists sessions_token_idx on sessions (token_hash);
  create index if not exists sessions_expires_idx on sessions (expires_at);

  create table if not exists app_settings (
    key text primary key,
    value jsonb not null
  );
`;

export const DEFAULT_SETTINGS: AppSettings = {
  name: "Kantin Mini",
  tagline: "Resep Rumahan, Rasa Juara.",
  address: "Gang Melong Kaler I no. 1",
  hours: "Senin–Jumat, 08.00–19.00",
  description: "Masakan harian dengan cita rasa Nusantara yang jujur dan ramah di kantong.",
  logo: "/assets/favicon.svg",
  receiptWidth: "80",
  autoKitchen: true,
  autoCustomer: true,
  midtransEnvironment: "sandbox",
  midtransClientKey: "",
  midtransServerKey: "",
  midtransWebhook: "",
  orderMode: "whatsapp",
  whatsappNumber: "6285117693117",
};

const menuById = (id: string) => KANTIN_DATA.menu.find((item: any) => item.id === id);

const optionLabels = (menu: any, optionIds: string[]): Localized[] => {
  const labels: Localized[] = [];
  for (const optionId of optionIds || []) {
    for (const group of menu?.options || []) {
      const choice = group.choices?.find((entry: any) => entry.id === optionId);
      if (choice) {
        labels.push({ id: choice.label.id, en: choice.label.en });
        break;
      }
    }
  }
  return labels;
};

const snapshotItems = (rawItems: any[]): OrderItem[] =>
  (rawItems || []).map((item: any) => {
    const menu: any = menuById(item.menuId);
    return {
      menuId: item.menuId,
      qty: Number(item.qty) || 1,
      options: Array.isArray(item.options) ? item.options : [],
      note: String(item.note || ""),
      name: menu ? { id: menu.name.id, en: menu.name.en } : { id: item.menuId, en: item.menuId },
      price: Number(menu?.price ?? item.price ?? 0),
      optionLabels: optionLabels(menu, item.options || []),
    };
  });

const totalItems = (items: OrderItem[]) => items.reduce((sum, item) => sum + item.price * item.qty, 0);

const insertOrder = async (db: any, order: {
  code: string;
  customer: string;
  type: "dine-in" | "takeaway";
  table: number | null;
  items: OrderItem[];
  total?: number;
  payment: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  source: OrderSource;
  createdAt: Date;
  paidAt?: Date | null;
  expiresAt?: Date | null;
  paymentCode?: string | null;
  paymentReference?: string | null;
  qrUrl?: string | null;
  note?: string | null;
  fulfillmentTime?: string | null;
}) => {
  const id = crypto.randomUUID();
  const total = order.total ?? totalItems(order.items);
  await db.query(
    `insert into orders (
      id, code, public_token, customer, type, table_no, items, total, payment,
      payment_status, order_status, source, payment_code, payment_reference, qr_url,
      note, fulfillment_time, created_at, paid_at, expires_at, updated_at
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$18)`,
    [
      id,
      order.code,
      createToken(24),
      order.customer,
      order.type,
      order.table,
      JSON.stringify(order.items),
      total,
      order.payment,
      order.paymentStatus,
      order.orderStatus,
      order.source,
      order.paymentCode || null,
      order.paymentReference || null,
      order.qrUrl || null,
      order.note || null,
      order.fulfillmentTime || null,
      order.createdAt.toISOString(),
      order.paidAt ? order.paidAt.toISOString() : null,
      order.expiresAt ? order.expiresAt.toISOString() : null,
    ],
  );
};

async function seed(db: PGlite) {
  const existing = await db.query<{ count: string }>("select count(*)::text as count from categories");
  if (Number(existing.rows[0]?.count || 0) > 0) {
    // Sinkronkan status master dari lib/data.ts ke menu yang sudah ada
    const menu = KANTIN_DATA.menu || [];
    for (const item of menu) {
      await db.query(
        `update menus
            set popular = $1,
                available = $2,
                options = $3,
                price = $4,
                name_id = $6,
                name_en = $7,
                desc_id = $8,
                desc_en = $9
          where id = $5`,
        [
          Boolean(item.popular),
          item.available !== false,
          JSON.stringify(item.options || []),
          item.price,
          item.id,
          item.name.id,
          item.name.en,
          item.desc?.id || "",
          item.desc?.en || "",
        ],
      );
    }
    return;
  }

  await db.transaction(async (tx) => {
    const categories = KANTIN_DATA.categories || [];
    for (let index = 0; index < categories.length; index += 1) {
      const category = categories[index];
      await tx.query(
        "insert into categories (id, name_id, name_en, icon, sort_order) values ($1,$2,$3,$4,$5)",
        [category.id, category.name.id, category.name.en, category.icon || "utensils", index],
      );
    }

    const menu = KANTIN_DATA.menu || [];
    for (let index = 0; index < menu.length; index += 1) {
      const item = menu[index];
      await tx.query(
        `insert into menus (
          id, category_id, name_id, name_en, desc_id, desc_en, price, image,
          available, popular, sort_order, options
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          item.id,
          item.category,
          item.name.id,
          item.name.en,
          item.desc?.id || "",
          item.desc?.en || "",
          item.price,
          item.image,
          item.available !== false,
          Boolean(item.popular),
          index,
          JSON.stringify(item.options || []),
        ],
      );
    }

    const accounts = KANTIN_DATA.accounts || [];
    for (let index = 0; index < accounts.length; index += 1) {
      const account = accounts[index];
      await tx.query(
        `insert into staff_accounts (id, name, email, role, active, password_hash, last_login_at)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [
          account.id,
          account.name,
          account.email,
          account.role,
          account.active !== false,
          hashPassword("kantin123"),
          new Date(Date.now() - (index + 1) * 3600000).toISOString(),
        ],
      );
    }

    await tx.query(
      "insert into app_settings (key, value) values ('app', $1) on conflict (key) do nothing",
      [JSON.stringify(DEFAULT_SETTINGS)],
    );

    const now = new Date();
    const activeMinutes = [4, 9, 18, 22, 31, 38, 45, 52, 60, 75];
    const activeOrders = KANTIN_DATA.orders || [];
    for (let index = 0; index < activeOrders.length; index += 1) {
      const raw = activeOrders[index];
      const items = snapshotItems(raw.items);
      const createdAt = new Date(now.getTime() - activeMinutes[index] * 60000);
      const paid = raw.paymentStatus === "paid";
      const expired = raw.paymentStatus === "expired";
      await insertOrder(tx, {
        code: raw.code,
        customer: raw.customer,
        type: raw.type,
        table: raw.table,
        items,
        total: raw.total || totalItems(items),
        payment: raw.payment,
        paymentStatus: raw.paymentStatus,
        orderStatus: expired ? "cancelled" : raw.orderStatus,
        source: raw.source,
        createdAt,
        paidAt: paid ? new Date(createdAt.getTime() + 8 * 60000) : null,
        expiresAt: new Date(createdAt.getTime() + 30 * 60000),
        paymentCode: raw.paymentCode || (raw.payment === "Cash" && raw.paymentStatus === "pending" ? createPaymentCode() : null),
        paymentReference: paid && raw.payment === "QRIS" ? `QRIS-${raw.code}` : null,
      });
    }

    // Historical orders keep reports and charts populated for the last two weeks.
    const names = ["Rani", "Hendra", "Tio", "Sari", "Andi", "Nabila", "Yusuf", "Mila", "Fikri", "Raka", "Lala", "Dinda"];
    const available = menu.filter((item: any) => item.available !== false);
    for (let index = 0; index < 28; index += 1) {
      const day = Math.floor(index / 2);
      const createdAt = new Date(now.getTime() - (day * 24 + (index % 5) + 1) * 3600000);
      const first = available[(index * 3) % available.length];
      const second = available[(index * 5 + 2) % available.length];
      const rawItems = [
        { menuId: first.id, qty: index % 4 === 0 ? 2 : 1, options: first.options?.length ? [first.options[0].choices[0].id] : [], note: "" },
        ...(index % 3 === 0 ? [{ menuId: second.id, qty: 1, options: [], note: "" }] : []),
      ];
      const items = snapshotItems(rawItems);
      const payment: PaymentMethod = index % 3 === 0 ? "Cash" : "QRIS";
      const paidAt = new Date(createdAt.getTime() + 7 * 60000);
      await insertOrder(tx, {
        code: `H-${String(101 + index)}`,
        customer: names[index % names.length],
        type: index % 4 === 0 ? "takeaway" : "dine-in",
        table: index % 4 === 0 ? null : (index % 7) + 1,
        items,
        payment,
        paymentStatus: "paid",
        orderStatus: "ready",
        source: index % 5 === 0 ? "POS" : "QR",
        createdAt,
        paidAt,
        expiresAt: new Date(createdAt.getTime() + 30 * 60000),
        paymentCode: payment === "Cash" ? createPaymentCode() : null,
        paymentReference: payment === "QRIS" ? `QRIS-H-${101 + index}` : null,
      });
    }
  });
}

async function initialize() {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
  );

  const defaultDir = isServerless
    ? "/tmp/pglite"
    : path.join(os.homedir(), ".local", "share", "kantinmini", "pglite");

  let dataDir = process.env.PGLITE_DATA_DIR || defaultDir;

  if (!dataDir.startsWith("memory://")) {
    try {
      await mkdir(path.dirname(dataDir), { recursive: true });
    } catch {
      try {
        dataDir = "/tmp/pglite";
        await mkdir(path.dirname(dataDir), { recursive: true });
      } catch {
        dataDir = "memory://";
      }
    }
  }

  let db: PGlite;
  try {
    db = new PGlite(dataDir);
    await db.waitReady;
  } catch (err) {
    console.warn("PGlite failed to open on", dataDir, "falling back to memory://", err);
    db = new PGlite("memory://");
    await db.waitReady;
  }

  await db.exec(schema);
  await seed(db);
  return db;
}

export function getDb() {
  if (!globalForDb.__kantinDbPromise) {
    globalForDb.__kantinDbPromise = initialize().catch((error) => {
      globalForDb.__kantinDbPromise = undefined;
      throw error;
    });
  }
  return globalForDb.__kantinDbPromise;
}

export async function expirePendingOrders() {
  const db = await getDb();
  await db.query(
    `update orders
       set payment_status = 'expired', order_status = 'cancelled', updated_at = now()
     where payment_status = 'pending' and expires_at is not null and expires_at <= now()`,
  );
}
