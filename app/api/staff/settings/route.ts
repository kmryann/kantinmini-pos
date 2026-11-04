import { getAppSettings, updateAppSettings } from "@/lib/server/settings";
import { requireStaff } from "@/lib/server/auth";
import { fail, ok, readJson } from "@/lib/server/http";

export async function GET() {
  try {
    await requireStaff(["admin"]);
    return ok(await getAppSettings());
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireStaff(["admin"]);
    return ok(await updateAppSettings(await readJson<any>(request)));
  } catch (error) {
    return fail(error);
  }
}
