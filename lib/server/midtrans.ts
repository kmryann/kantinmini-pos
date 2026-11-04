import { createHash } from "node:crypto";
import { getAppSettings } from "@/lib/server/settings";
import type { Order } from "@/lib/api-types";

type QrisCharge = {
  reference: string | null;
  qrUrl: string | null;
};

async function midtransConfig() {
  const settings = await getAppSettings();
  const serverKey = process.env.MIDTRANS_SERVER_KEY || settings.midtransServerKey;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || settings.midtransClientKey;
  const environment = process.env.MIDTRANS_ENVIRONMENT || settings.midtransEnvironment;
  return {
    serverKey,
    clientKey,
    isProduction: environment === "production",
  };
}

export async function createQrisCharge(order: Order): Promise<QrisCharge> {
  const config = await midtransConfig();
  if (!config.serverKey) {
    return { reference: `MOCK-${order.code}`, qrUrl: "/assets/qr/qris-demo.svg" };
  }

  try {
    const mod: any = await import("midtrans-client");
    const Midtrans = mod.default || mod;
    const core = new Midtrans.CoreApi({
      isProduction: config.isProduction,
      serverKey: config.serverKey,
      clientKey: config.clientKey,
    });
    const charge = await core.charge({
      payment_type: "qris",
      transaction_details: {
        order_id: order.code,
        gross_amount: order.total,
      },
      qris: { acquire: "gopay" },
      custom_expiry: {
        expiry_duration: 30,
        unit: "minute",
      },
    });
    const action = Array.isArray(charge.actions)
      ? charge.actions.find((entry: any) => entry.name === "generate_qr_code")
      : null;
    return {
      reference: charge.transaction_id || null,
      qrUrl: action?.url || null,
    };
  } catch (error) {
    console.error("Midtrans charge failed, using demo QR:", error);
    return { reference: `MOCK-${order.code}`, qrUrl: "/assets/qr/qris-demo.svg" };
  }
}

export async function verifyMidtransSignature(payload: {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
}) {
  const config = await midtransConfig();
  if (!config.serverKey) return false;
  const raw = `${payload.order_id || ""}${payload.status_code || ""}${payload.gross_amount || ""}${config.serverKey}`;
  const expected = createHash("sha512").update(raw).digest("hex");
  return expected === payload.signature_key;
}

export async function isMidtransConfigured() {
  const config = await midtransConfig();
  return Boolean(config.serverKey);
}
