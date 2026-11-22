export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_REVIEW_URL = "https://g.page/r/CQ4wdkPxmEqzEBE/review";

export async function GET() {
  const target = (process.env.GOOGLE_REVIEW_URL || DEFAULT_REVIEW_URL).trim();
  return new Response(null, {
    status: 307,
    headers: {
      Location: target,
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
