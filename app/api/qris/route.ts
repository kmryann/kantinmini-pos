import { generateQrisPng } from "@/lib/server/qris";
import { ApiError, fail } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const amount = Number(url.searchParams.get("amount"));
    if (!Number.isFinite(amount) || amount < 1) {
      throw new ApiError(400, "Nominal QRIS tidak valid.");
    }
    const png = await generateQrisPng(amount);
    const download = url.searchParams.get("download") === "1";
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, max-age=0",
        ...(download
          ? { "Content-Disposition": `attachment; filename="qris-kantinmini-${Math.round(amount)}.png"` }
          : {}),
      },
    });
  } catch (error) {
    return fail(error);
  }
}
