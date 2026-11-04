import { cookies } from "next/headers";
import type { Role, SessionUser } from "@/lib/api-types";
import { getDb } from "@/lib/server/db";
import { ApiError } from "@/lib/server/http";
import { createId, createToken, hashToken, verifyPassword } from "@/lib/server/crypto";

export const SESSION_COOKIE = "kantin_session";
const SESSION_DAYS = 7;

type SessionRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

export async function createSession(accountId: string) {
  const db = await getDb();
  const token = createToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db.query(
    "insert into sessions (id, token_hash, account_id, expires_at) values ($1,$2,$3,$4)",
    [createId(), hashToken(token), accountId, expiresAt.toISOString()],
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.query("delete from sessions where token_hash = $1", [hashToken(token)]);
  }
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await getDb();
  const result = await db.query<SessionRow>(
    `select a.id, a.name, a.email, a.role, a.active
       from sessions s
       join staff_accounts a on a.id = s.account_id
      where s.token_hash = $1 and s.expires_at > now()
      limit 1`,
    [hashToken(token)],
  );
  const user = result.rows[0];
  if (!user || !user.active) return null;
  return user;
}

export async function requireStaff(roles?: Role[]) {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Silakan masuk terlebih dahulu.");
  if (roles && !roles.includes(user.role)) {
    throw new ApiError(403, "Role ini tidak memiliki akses.");
  }
  return user;
}

export async function loginWithPassword(email: string, password: string) {
  const db = await getDb();
  const result = await db.query<{ id: string; password_hash: string; active: boolean }>(
    "select id, password_hash, active from staff_accounts where lower(email) = lower($1) limit 1",
    [email.trim()],
  );
  const account = result.rows[0];
  if (!account || !account.active || !verifyPassword(password, account.password_hash)) {
    throw new ApiError(401, "Email atau kata sandi salah.");
  }
  await db.query("update staff_accounts set last_login_at = now() where id = $1", [account.id]);
  await createSession(account.id);
  return getSessionUser();
}

export async function loginDemo(role: Role) {
  if (process.env.DEMO_MODE === "false") {
    throw new ApiError(403, "Mode demo dinonaktifkan.");
  }
  const db = await getDb();
  const result = await db.query<{ id: string }>(
    "select id from staff_accounts where role = $1 and active = true order by created_at asc limit 1",
    [role],
  );
  const account = result.rows[0];
  if (!account) throw new ApiError(404, "Akun demo tidak ditemukan.");
  await db.query("update staff_accounts set last_login_at = now() where id = $1", [account.id]);
  await createSession(account.id);
  return getSessionUser();
}
