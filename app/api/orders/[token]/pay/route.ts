import { getOrderByToken, markOrderPaidByCode } from "@/lib/server/orders";
import { isMidtransConfigured } from "@/lib/server/midtrans";
import { fail, ok } from "@/lib/server/http";
import { ApiError } from "@/lib/server/http";

export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const order = await getOrderByToken(token);
    const demoAllowed = process.env.DEMO_MODE !== "false";
    const configured = await isMidtransConfigured();
    if (configured && !demoAllowed) {
      throw new ApiError(403, "Pembayaran QRIS harus dikonfirmasi melalui webhook Midtrans.");
    }
    if (order.paymentStatus === "paid") return ok(order);
    const updated = await markOrderPaidByCode(order.code);
    if (!updated) throw new ApiError(400, "Pesanan tidak dapat dibayar.");
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}
