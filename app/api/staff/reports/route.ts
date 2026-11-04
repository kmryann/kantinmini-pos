import { buildReport, dateRange, periodRange } from "@/lib/server/reports";
import { requireStaff } from "@/lib/server/auth";
import { fail, ok } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireStaff(["cashier", "manager", "admin"]);
    const params = new URL(request.url).searchParams;
    const period = params.get("period");
    const range = period === "today" || period === "week" || period === "month"
      ? periodRange(period)
      : dateRange(params.get("from"), params.get("to"));
    return ok(await buildReport(range.from, range.to, range.previousFrom, range.previousTo));
  } catch (error) {
    return fail(error);
  }
}
