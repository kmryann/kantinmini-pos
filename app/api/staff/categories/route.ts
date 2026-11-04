import { createCategory, getMenuPayload } from "@/lib/server/menu";
import { requireStaff } from "@/lib/server/auth";
import { fail, ok, readJson } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    await requireStaff(["manager", "admin"]);
    const id = await createCategory(await readJson<any>(request));
    return ok({ id, ...(await getMenuPayload()) }, 201);
  } catch (error) {
    return fail(error);
  }
}
