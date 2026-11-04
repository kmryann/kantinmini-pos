import { loginDemo } from "@/lib/server/auth";
import { fail, ok, readJson } from "@/lib/server/http";
import type { Role } from "@/lib/api-types";
import { ApiError } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ role?: Role }>(request);
    if (!body.role || !["cashier", "manager", "admin"].includes(body.role)) {
      throw new ApiError(400, "Role demo tidak valid.");
    }
    const user = await loginDemo(body.role);
    if (!user) throw new ApiError(500, "Sesi gagal dibuat.");
    return ok(user);
  } catch (error) {
    return fail(error);
  }
}
