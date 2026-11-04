import { buildDashboard } from "@/lib/server/reports";
import { requireStaff } from "@/lib/server/auth";
import { fail, ok } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireStaff(["manager", "admin"]);
    const period = new URL(request.url).searchParams.get("period");
    const safePeriod = period === "today" || period === "month" ? period : "week";
    return ok(await buildDashboard(safePeriod));
  } catch (error) {
    return fail(error);
  }
}
