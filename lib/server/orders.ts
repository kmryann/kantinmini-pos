import type { CreateOrderInput, Order, OrderItem, PaymentMethod, OrderSource } from "@/lib/api-types";
import { getDb, expirePendingOrders } from "@/lib/server/db";
import { createPaymentCode, createToken } from "@/lib/server/crypto";
import { ApiError } from "@/lib/server/http";
import { dateKey } from "@/lib/format";
import { createQrisCharge } from "@/lib/server/midtrans";

type OrderRow = {
  id: string;
  code: string;
  public_token: string | null;
  customer: string;
  type: "dine-in" | "takeaway";
  table_no: number | null;
  items: OrderItem[] | string;
  total: number | string;
  payment: PaymentMethod;
  payment_status: Order["paymentStatus"];
  order_status: Order["orderStatus"];
  source: OrderSource;
  payment_code: string | null;
  payment_reference: string | null;
  qr_url: string | null;
  created_at: string | Date;
  paid_at: string | Date | null;
  expires_at: string | Date | null;
};

const iso = (value: string | Date | null | undefined) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

export function serializeOrder(row: OrderRow, includeToken = false): Order {
  const items = typeof row.items === "string" ? (JSON.parse(row.items) as OrderItem[]) : row.items;
  return {
    id: row.id,
    code: row.code,
    customer: row.customer,
    type: row.type,
    table: row.table_no,
    items: Array.isArray(items) ? items : [],
    total: Number(row.total),
    payment: row.payment,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    source: row.source,
    createdAt: iso(row.created_at) as string,
    paidAt: iso(row.paid_at),
    expiresAt: iso(row.expires_at),
    paymentCode: row.payment_code,
    paymentReference: row.payment_reference,
    qrUrl: row.qr_url,
    ...(includeToken && row.public_token ? { publicToken: row.public_token } : {}),
  };
}

const codeFromSequence = async (prefix: "A" | "P") => {
  const db = await getDb();
  const result = await db.query<{ value: string }>(
    "select nextval('order_code_seq')::text as value",
  );
  return `${prefix}-${String(result.rows[0]?.value || Date.now()).padStart(3, "0")}`;
};

const uniquePaymentCode = async () => {
  const db = await getDb();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = createPaymentCode();
    const existing = await db.query("select 1 from orders where payment_code = $1 limit 1", [code]);
    if (!existing.rows.length) return code;
  }
  return createPaymentCode();
};

const normalizeQty = (value: unknown) => {
  const qty = Math.floor(Number(value));
  if (!Number.isFinite(qty) || qty < 1 || qty > 99) {
    throw new ApiError(400, "Jumlah item tidak valid.");
  }
  return qty;
};

export async function createOrder(input: CreateOrderInput, source: OrderSource) {
  const db = await getDb();
  if (!input.customer?.trim()) throw new ApiError(400, "Nama pelanggan wajib diisi.");
  if (!["dine-in", "takeaway"].includes(input.type)) throw new ApiError(400, "Tipe pesanan tidak valid.");
  if (!["QRIS", "Cash"].includes(input.payment)) throw new ApiError(400, "Metode pembayaran tidak valid.");
  if (!Array.isArray(input.items) || input.items.length === 0) throw new ApiError(400, "Pesanan masih kosong.");

  const menuResult = await db.query<any>("select * from menus");
  const menus = new Map(menuResult.rows.map((row) => [row.id, row]));
  const table = input.type === "dine-in" ? Number(input.table || 0) : null;
  if (input.type === "dine-in" && (!Number.isInteger(table) || table < 1 || table > 7)) {
    throw new ApiError(400, "Nomor meja harus antara 1 dan 7.");
  }

  const items: OrderItem[] = input.items.map((raw) => {
    const menu = menus.get(raw.menuId);
    if (!menu) throw new ApiError(400, "Menu tidak ditemukan.");
    if (!menu.available) throw new ApiError(400, `${menu.name_id} sedang habis.`);
    const selected = Array.isArray(raw.options) ? raw.options : [];
    const groups = typeof menu.options === "string" ? JSON.parse(menu.options) : menu.options || [];
    const labels: { id: string; en: string }[] = [];
    for (const group of groups) {
      const choice = group.choices?.find((entry: any) => selected.includes(entry.id));
      if (group.required && !choice) {
        throw new ApiError(400, `Pilihan ${group.label?.id || "menu"} wajib diisi.`);
      }
      if (choice) labels.push({ id: choice.label.id, en: choice.label.en });
    }
    return {
      menuId: menu.id,
      qty: normalizeQty(raw.qty),
      options: selected,
      note: String(raw.note || "").slice(0, 240),
      name: { id: menu.name_id, en: menu.name_en },
      price: Number(menu.price),
      optionLabels: labels,
    };
  });

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const code = await codeFromSequence(source === "POS" ? "P" : "A");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60000);
  const paidImmediately = source === "POS" && input.payment === "Cash";
  const paymentCode = input.payment === "Cash" ? await uniquePaymentCode() : null;
  const token = createToken(24);
  const id = crypto.randomUUID();

  const result = await db.query<OrderRow>(
    `insert into orders (
      id, code, public_token, customer, type, table_no, items, total, payment,
      payment_status, order_status, source, payment_code, created_at, paid_at,
      expires_at, updated_at
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$14)
    returning *`,
    [
      id,
      code,
      token,
      input.customer.trim(),
      input.type,
      table,
      JSON.stringify(items),
      total,
      input.payment,
      paidImmediately ? "paid" : "pending",
      "new",
      source,
      paymentCode,
      now.toISOString(),
      paidImmediately ? now.toISOString() : null,
      expiresAt.toISOString(),
    ],
  );

  let order = serializeOrder(result.rows[0], true);

  if (input.payment === "QRIS" && !paidImmediately) {
    const charge = await createQrisCharge(order);
    const updated = await db.query<OrderRow>(
      `update orders
          set payment_reference = $1, qr_url = $2, updated_at = now()
        where id = $3
        returning *`,
      [charge.reference, charge.qrUrl, id],
    );
    order = serializeOrder(updated.rows[0], true);
  }

  return order;
}

export async function getOrderByToken(token: string) {
  await expirePendingOrders();
  const db = await getDb();
  const result = await db.query<OrderRow>(
    "select * from orders where public_token = $1 limit 1",
    [token],
  );
  if (!result.rows[0]) throw new ApiError(404, "Pesanan tidak ditemukan.");
  return serializeOrder(result.rows[0]);
}

export async function getOrderById(id: string) {
  await expirePendingOrders();
  const db = await getDb();
  const result = await db.query<OrderRow>("select * from orders where id = $1 limit 1", [id]);
  if (!result.rows[0]) throw new ApiError(404, "Pesanan tidak ditemukan.");
  return serializeOrder(result.rows[0], true);
}

export async function getOrderByCode(code: string) {
  const db = await getDb();
  const result = await db.query<OrderRow>("select * from orders where code = $1 limit 1", [code]);
  if (!result.rows[0]) throw new ApiError(404, "Pesanan tidak ditemukan.");
  return serializeOrder(result.rows[0], true);
}

export async function listOrders() {
  await expirePendingOrders();
  const db = await getDb();
  const result = await db.query<OrderRow>("select * from orders order by created_at desc");
  return result.rows.map((row) => serializeOrder(row));
}

export async function listCashierOrders() {
  await expirePendingOrders();
  const db = await getDb();
  const start = new Date(`${dateKey(new Date())}T00:00:00+07:00`);
  const result = await db.query<OrderRow>(
    "select * from orders where created_at >= $1 order by created_at desc",
    [start.toISOString()],
  );
  return result.rows.map((row) => serializeOrder(row));
}

export async function updateOrderStatus(id: string, action: string) {
  const db = await getDb();
  const current = await getOrderById(id);
  if (action === "accept-cash") {
    if (current.payment !== "Cash" || current.paymentStatus !== "pending") {
      throw new ApiError(400, "Pesanan ini tidak menunggu konfirmasi cash.");
    }
    const paidAt = new Date().toISOString();
    const result = await db.query<OrderRow>(
      `update orders set payment_status='paid', paid_at=$1, updated_at=now()
        where id=$2 returning *`,
      [paidAt, id],
    );
    return serializeOrder(result.rows[0]);
  }
  if (action === "cooking" || action === "ready") {
    if (current.paymentStatus !== "paid") throw new ApiError(400, "Pesanan belum dibayar.");
    const status = action === "cooking" ? "cooking" : "ready";
    const result = await db.query<OrderRow>(
      "update orders set order_status=$1, updated_at=now() where id=$2 returning *",
      [status, id],
    );
    return serializeOrder(result.rows[0]);
  }
  if (action === "cancel") {
    if (current.paymentStatus !== "pending") throw new ApiError(400, "Hanya pesanan belum dibayar yang bisa dibatalkan.");
    const result = await db.query<OrderRow>(
      `update orders set payment_status='cancelled', order_status='cancelled', updated_at=now()
        where id=$1 returning *`,
      [id],
    );
    return serializeOrder(result.rows[0]);
  }
  if (action === "mark-paid") {
    if (current.paymentStatus === "paid") return current;
    const paidAt = new Date().toISOString();
    const result = await db.query<OrderRow>(
      `update orders set payment_status='paid', paid_at=$1, updated_at=now()
        where id=$2 returning *`,
      [paidAt, id],
    );
    return serializeOrder(result.rows[0]);
  }
  throw new ApiError(400, "Aksi pesanan tidak dikenal.");
}

export async function markOrderPaidByCode(code: string) {
  const db = await getDb();
  const result = await db.query<OrderRow>(
    `update orders set payment_status='paid', paid_at=now(), updated_at=now()
      where code=$1 and payment_status='pending' returning *`,
    [code],
  );
  if (!result.rows[0]) return null;
  return serializeOrder(result.rows[0]);
}
