import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { requireStaff } from "@/lib/server/auth";
import { ApiError, fail, ok } from "@/lib/server/http";
import { createId } from "@/lib/server/crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireStaff(["manager", "admin"]);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "File foto wajib diunggah.");
    if (file.size > 6 * 1024 * 1024) throw new ApiError(400, "Ukuran foto maksimal 6 MB.");
    if (!file.type.startsWith("image/")) throw new ApiError(400, "File harus berupa gambar.");

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${createId()}.webp`;
    const directory = path.join(process.cwd(), "public", "uploads", "menus");
    await mkdir(directory, { recursive: true });
    const optimized = await sharp(buffer)
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();
    await writeFile(path.join(directory, filename), optimized);
    return ok({ url: `/uploads/menus/${filename}` }, 201);
  } catch (error) {
    return fail(error);
  }
}
