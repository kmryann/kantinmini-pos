import { loginWithPassword } from "@/lib/server/auth";
import { fail, ok, readJson } from "@/lib/server/http";
import { ApiError } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ email?: string; password?: string }>(request);
    if (!body.email || !body.password) throw new ApiError(400, "Email dan kata sandi wajib diisi.");
    const user = await loginWithPassword(body.email, body.password);
    if (!user) throw new ApiError(500, "Sesi gagal dibuat.");
    return ok(user);
  } catch (error) {
    return fail(error);
  }
}
