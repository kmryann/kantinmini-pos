import type { Category, MenuItem, MenuOptionGroup } from "@/lib/api-types";
import { getDb } from "@/lib/server/db";
import { ApiError } from "@/lib/server/http";

type CategoryRow = { id: string; name_id: string; name_en: string; icon: string; sort_order: number };
type MenuRow = {
  id: string;
  category_id: string;
  name_id: string;
  name_en: string;
  desc_id: string;
  desc_en: string;
  price: number | string;
  image: string;
  available: boolean;
  popular: boolean;
  sort_order: number;
  options: MenuOptionGroup[] | string;
};

const slugify = (value: string, fallback = "item") =>
  String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;

const normalizeCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: { id: row.name_id, en: row.name_en },
  icon: row.icon,
  sortOrder: row.sort_order,
});

const normalizeMenu = (row: MenuRow): MenuItem => ({
  id: row.id,
  category: row.category_id,
  name: { id: row.name_id, en: row.name_en },
  desc: { id: row.desc_id, en: row.desc_en },
  price: Number(row.price),
  image: row.image,
  available: row.available,
  popular: row.popular,
  sortOrder: row.sort_order,
  options: typeof row.options === "string" ? JSON.parse(row.options) : row.options || [],
});

export async function getMenuPayload() {
  const db = await getDb();
  const [categories, menu] = await Promise.all([
    db.query<CategoryRow>("select * from categories order by sort_order asc, id asc"),
    db.query<MenuRow>("select * from menus order by sort_order asc, id asc"),
  ]);
  return {
    categories: categories.rows.map(normalizeCategory),
    menu: menu.rows.map(normalizeMenu),
  };
}

function cleanOptions(value: unknown): MenuOptionGroup[] {
  if (!Array.isArray(value)) return [];
  return value.map((group: any, index) => ({
    id: String(group.id || `group-${index + 1}`),
    label: {
      id: String(group.label?.id || group.label || "Pilihan"),
      en: String(group.label?.en || group.label || "Option"),
    },
    required: group.required !== false,
    choices: Array.isArray(group.choices)
      ? group.choices.map((choice: any, choiceIndex: number) => ({
          id: String(choice.id || `choice-${choiceIndex + 1}`),
          label: {
            id: String(choice.label?.id || choice.label || "Pilihan"),
            en: String(choice.label?.en || choice.label || "Choice"),
          },
        }))
      : [],
  }));
}

export async function createMenu(input: any) {
  const db = await getDb();
  const id = slugify(input.id || input.name?.id || input.name?.en, "menu");
  const existing = await db.query("select 1 from menus where id = $1", [id]);
  if (existing.rows.length) throw new ApiError(409, "ID menu sudah dipakai.");
  const sortResult = await db.query<{ max: number | null }>("select max(sort_order) as max from menus");
  await db.query(
    `insert into menus (
      id, category_id, name_id, name_en, desc_id, desc_en, price, image,
      available, popular, sort_order, options
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      id,
      input.category,
      input.name?.id || "",
      input.name?.en || input.name?.id || "",
      input.desc?.id || "",
      input.desc?.en || input.desc?.id || "",
      Math.max(0, Number(input.price) || 0),
      input.image || "/assets/menu/placeholder.webp",
      input.available !== false,
      Boolean(input.popular),
      Number(input.sortOrder ?? (Number(sortResult.rows[0]?.max) + 1 || 0)),
      JSON.stringify(cleanOptions(input.options)),
    ],
  );
  return id;
}

export async function updateMenu(id: string, input: any) {
  const db = await getDb();
  const existing = await db.query<MenuRow>("select * from menus where id = $1", [id]);
  if (!existing.rows[0]) throw new ApiError(404, "Menu tidak ditemukan.");
  const row = existing.rows[0];
  await db.query(
    `update menus set
      category_id=$1, name_id=$2, name_en=$3, desc_id=$4, desc_en=$5, price=$6,
      image=$7, available=$8, popular=$9, sort_order=$10, options=$11, updated_at=now()
     where id=$12`,
    [
      input.category ?? row.category_id,
      input.name?.id ?? row.name_id,
      input.name?.en ?? row.name_en,
      input.desc?.id ?? row.desc_id,
      input.desc?.en ?? row.desc_en,
      input.price !== undefined ? Math.max(0, Number(input.price) || 0) : row.price,
      input.image ?? row.image,
      input.available !== undefined ? Boolean(input.available) : row.available,
      input.popular !== undefined ? Boolean(input.popular) : row.popular,
      input.sortOrder !== undefined ? Number(input.sortOrder) : row.sort_order,
      input.options !== undefined ? JSON.stringify(cleanOptions(input.options)) : JSON.stringify(typeof row.options === "string" ? JSON.parse(row.options) : row.options),
      id,
    ],
  );
  return getMenuPayload();
}

export async function deleteMenu(id: string) {
  const db = await getDb();
  await db.query("delete from menus where id = $1", [id]);
}

export async function createCategory(input: any) {
  const db = await getDb();
  const id = slugify(input.id || input.name?.id || input.name?.en, "kategori");
  const existing = await db.query("select 1 from categories where id = $1", [id]);
  if (existing.rows.length) throw new ApiError(409, "ID kategori sudah dipakai.");
  const sort = await db.query<{ max: number | null }>("select max(sort_order) as max from categories");
  await db.query(
    "insert into categories (id,name_id,name_en,icon,sort_order) values ($1,$2,$3,$4,$5)",
    [
      id,
      input.name?.id || "",
      input.name?.en || input.name?.id || "",
      input.icon || "utensils",
      Number(input.sortOrder ?? (Number(sort.rows[0]?.max) + 1 || 0)),
    ],
  );
  return id;
}

export async function updateCategory(id: string, input: any) {
  const db = await getDb();
  await db.query(
    "update categories set name_id=$1, name_en=$2, icon=$3, sort_order=$4 where id=$5",
    [
      input.name?.id || "",
      input.name?.en || input.name?.id || "",
      input.icon || "utensils",
      Number(input.sortOrder || 0),
      id,
    ],
  );
  return getMenuPayload();
}

export async function deleteCategory(id: string) {
  const db = await getDb();
  const count = await db.query<{ count: string }>("select count(*)::text as count from menus where category_id = $1", [id]);
  if (Number(count.rows[0]?.count || 0) > 0) {
    throw new ApiError(409, "Kategori masih dipakai oleh menu.");
  }
  await db.query("delete from categories where id = $1", [id]);
}
