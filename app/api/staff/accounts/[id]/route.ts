import { getDb } from "@/lib/server/db";
import { requireStaff } from "@/lib/server/auth";
import { ApiError, fail, ok, readJson } from "@/lib/server/http";
import { hashPassword } from "@/lib/server/crypto";

type Row = {
  id: string;
  name: string;
  email: string;
  role: "cashier" | "manager" | "admin";
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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireStaff(["admin"]);
    const { id } = await context.params;
    const body = await readJson<any>(request);
    const db = await getDb();
    const existing = await db.query<Row>("select * from staff_accounts where id=$1", [id]);
    const current = existing.rows[0];
    if (!current) throw new ApiError(404, "Akun tidak ditemukan.");
    const nextActive = body.active !== undefined ? Boolean(body.active) : current.active;
    const nextRole = body.role ?? current.role;
    const nextEmail = body.email ?? current.email;
    if (nextEmail.toLowerCase() !== current.email.toLowerCase()) {
      const duplicate = await db.query("select 1 from staff_accounts where lower(email)=lower($1) and id<>$2", [nextEmail, id]);
      if (duplicate.rows.length) throw new ApiError(409, "Email sudah digunakan.");
    }
    if (current.role === "admin" && (nextRole !== "admin" || !nextActive)) {
      const activeAdmins = await db.query<{ count: string }>(
        "select count(*)::text as count from staff_accounts where role='admin' and active=true",
      );
      if (Number(activeAdmins.rows[0]?.count || 0) <= 1) {
        throw new ApiError(400, "Minimal satu admin aktif harus tersedia.");
      }
    }
    if (id === admin.id && !nextActive) {
      throw new ApiError(400, "Tidak dapat menonaktifkan akun sendiri.");
    }
    const password = body.password ? hashPassword(String(body.password)) : null;
    await db.query(
      `update staff_accounts set
        name=$1, email=$2, role=$3, active=$4, updated_at=now()
        ${password ? ", password_hash=$6" : ""}
       where id=$5`,
      [body.name ?? current.name, nextEmail, nextRole, nextActive, id, ...(password ? [password] : [])],
    );
    const result = await db.query<Row>("select * from staff_accounts where id=$1", [id]);
    return ok(serialize(result.rows[0]));
  } catch (error) {
    return fail(error);
  }
}
