import { requireStaff } from "@/lib/server/auth";
import { getAppSettings } from "@/lib/server/settings";
import { fail, ok } from "@/lib/server/http";

export async function GET() {
  try {
    await requireStaff(["cashier", "manager", "admin"]);
    const settings = await getAppSettings();
    return ok({
      name: settings.name,
      address: settings.address,
      receiptWidth: settings.receiptWidth,
      autoKitchen: settings.autoKitchen,
      autoCustomer: settings.autoCustomer,
    });
  } catch (error) {
    return fail(error);
  }
}
