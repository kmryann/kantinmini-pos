import { getOrderByToken } from "@/lib/server/orders";
import { fail, ok } from "@/lib/server/http";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    return ok(await getOrderByToken(token));
  } catch (error) {
    return fail(error);
  }
}
