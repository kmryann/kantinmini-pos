import { getPublicSettings } from "@/lib/server/settings";
import { fail, ok } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await getPublicSettings());
  } catch (error) {
    return fail(error);
  }
}
