import { createOrder, listCashierOrders } from "@/lib/server/orders";
import { requireStaff } from "@/lib/server/auth";
import { fail, ok, readJson } from "@/lib/server/http";
import type { CreateOrderInput } from "@/lib/api-types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireStaff(["cashier", "admin"]);
    return ok(await listCashierOrders());
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireStaff(["cashier", "admin"]);
    const order = await createOrder(await readJson<CreateOrderInput>(request), "POS");
    return ok(order, 201);
  } catch (error) {
    return fail(error);
  }
}
