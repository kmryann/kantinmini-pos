import { getDb } from "@/lib/server/db";
import { requireStaff } from "@/lib/server/auth";
import { ApiError, fail, ok, readJson } from "@/lib/server/http";
import { createId, hashPassword } from "@/lib/server/crypto";
import type { Role } from "@/lib/api-types";

type Row = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  last_login_at: string | Date | null;
  created_at: string | Date;
};

const serialize = (row: Row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  active: row.active,
  lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
  createdAt: new Date(row.created_at).toISOString(),
});

export async function GET() {
  try {
    await requireStaff(["admin"]);
    const db = await getDb();
    const result = await db.query<Row>("select * from staff_accounts order by created_at asc, name asc");
    return ok(result.rows.map(serialize));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireStaff(["admin"]);
    const body = await readJson<any>(request);
    if (!body.name?.trim() || !body.email?.trim()) throw new ApiError(400, "Nama dan email wajib diisi.");
    if (!["cashier", "manager", "admin"].includes(body.role)) throw new ApiError(400, "Role tidak valid.");
    if (!body.password || String(body.password).length < 6) throw new ApiError(400, "Kata sandi minimal 6 karakter.");
    const db = await getDb();
    const existing = await db.query("select 1 from staff_accounts where lower(email) = lower($1)", [body.email.trim()]);
    if (existing.rows.length) throw new ApiError(409, "Email sudah digunakan.");
    const id = createId();
    await db.query(
      `insert into staff_accounts (id,name,email,role,active,password_hash)
       values ($1,$2,$3,$4,$5,$6)`,
      [id, body.name.trim(), body.email.trim(), body.role, body.active !== false, hashPassword(String(body.password))],
    );
    const result = await db.query<Row>("select * from staff_accounts where id=$1", [id]);
    return ok(serialize(result.rows[0]), 201);
  } catch (error) {
    return fail(error);
  }
}
