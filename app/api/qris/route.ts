import { generateQrisPng, MAX_QRIS_AMOUNT } from "@/lib/server/qris";
import { ApiError, fail } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawAmount = Number(url.searchParams.get("amount"));
    const amount = Math.round(rawAmount);
    if (!Number.isFinite(rawAmount) || amount < 1 || amount > MAX_QRIS_AMOUNT) {
      throw new ApiError(400, "Nominal QRIS tidak valid.");
    }
    const png = await generateQrisPng(amount);
    const download = url.searchParams.get("download") === "1";
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        ...(download
          ? { "Content-Disposition": `attachment; filename="qris-kantinmini-${amount}.png"` }
          : {}),
      },
    });
  } catch (error) {
    return fail(error);
  }
}
