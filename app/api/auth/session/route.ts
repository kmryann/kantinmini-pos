import { getSessionUser } from "@/lib/server/auth";
import { fail, ok } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok({ user: await getSessionUser() });
  } catch (error) {
    return fail(error);
  }
}
