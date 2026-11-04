import { getDb, expirePendingOrders } from "@/lib/server/db";
import { markOrderPaidByCode } from "@/lib/server/orders";
import { verifyMidtransSignature } from "@/lib/server/midtrans";
import { fail, ok, readJson } from "@/lib/server/http";
import { ApiError } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const body = await readJson<{
      order_id?: string;
      status_code?: string;
      gross_amount?: string;
      signature_key?: string;
      transaction_status?: string;
      fraud_status?: string;
      transaction_id?: string;
    }>(request);

    if (!(await verifyMidtransSignature(body))) {
      throw new ApiError(401, "Signature Midtrans tidak valid.");
    }
    if (!body.order_id) throw new ApiError(400, "order_id wajib diisi.");

    const status = body.transaction_status;
    if (status === "settlement" || (status === "capture" && body.fraud_status === "accept")) {
      const order = await markOrderPaidByCode(body.order_id);
      if (order) {
        const db = await getDb();
        await db.query(
          "update orders set payment_reference = coalesce($1, payment_reference), updated_at = now() where code = $2",
          [body.transaction_id || null, body.order_id],
        );
      }
    } else if (status === "expire") {
      const db = await getDb();
      await db.query(
        `update orders set payment_status='expired', order_status='cancelled', updated_at=now()
          where code=$1 and payment_status='pending'`,
        [body.order_id],
      );
      await expirePendingOrders();
    } else if (status === "cancel" || status === "deny" || status === "failure") {
      const db = await getDb();
      await db.query(
        `update orders set payment_status='cancelled', order_status='cancelled', updated_at=now()
          where code=$1 and payment_status='pending'`,
        [body.order_id],
      );
    }
    return ok({ received: true });
  } catch (error) {
    return fail(error);
  }
}
