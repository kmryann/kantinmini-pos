import { deleteCategory, updateCategory } from "@/lib/server/menu";
import { requireStaff } from "@/lib/server/auth";
import { fail, ok, readJson } from "@/lib/server/http";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff(["manager", "admin"]);
    const { id } = await context.params;
    return ok(await updateCategory(id, await readJson<any>(request)));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff(["manager", "admin"]);
    const { id } = await context.params;
    await deleteCategory(id);
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
