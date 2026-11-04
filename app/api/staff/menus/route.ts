import { createMenu, getMenuPayload } from "@/lib/server/menu";
import { requireStaff } from "@/lib/server/auth";
import { fail, ok, readJson } from "@/lib/server/http";

export async function GET() {
  try {
    await requireStaff(["manager", "admin"]);
    return ok(await getMenuPayload());
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireStaff(["manager", "admin"]);
    const body = await readJson<any>(request);
    const id = await createMenu(body);
    return ok({ id, ...(await getMenuPayload()) }, 201);
  } catch (error) {
    return fail(error);
  }
}
