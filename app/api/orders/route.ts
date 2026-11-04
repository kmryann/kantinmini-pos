import { createOrder } from "@/lib/server/orders";
import { fail, ok, readJson } from "@/lib/server/http";
import type { CreateOrderInput } from "@/lib/api-types";

export async function POST(request: Request) {
  try {
    const body = await readJson<CreateOrderInput>(request);
    const order = await createOrder(body, "QR");
    return ok(order, 201);
  } catch (error) {
    return fail(error);
  }
}
