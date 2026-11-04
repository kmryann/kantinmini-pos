import { getMenuPayload } from "@/lib/server/menu";
import { fail, ok } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await getMenuPayload());
  } catch (error) {
    return fail(error);
  }
}
