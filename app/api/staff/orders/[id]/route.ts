import { updateOrderStatus } from "@/lib/server/orders";
import { requireStaff } from "@/lib/server/auth";
import { fail, ok, readJson } from "@/lib/server/http";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff(["cashier", "admin"]);
    const { id } = await context.params;
    const body = await readJson<{ action: string }>(request);
    return ok(await updateOrderStatus(id, body.action));
  } catch (error) {
    return fail(error);
  }
}
