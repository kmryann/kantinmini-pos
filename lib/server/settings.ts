import type { AppSettings, PublicSettings } from "@/lib/api-types";
import { DEFAULT_SETTINGS, getDb } from "@/lib/server/db";

export async function getAppSettings(): Promise<AppSettings> {
  const db = await getDb();
  const result = await db.query<{ value: Partial<AppSettings> }>(
    "select value from app_settings where key = 'app' limit 1",
  );
  return { ...DEFAULT_SETTINGS, ...(result.rows[0]?.value || {}) };
}

export async function updateAppSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getAppSettings();
  const next: AppSettings = { ...current, ...patch };
  const db = await getDb();
  await db.query(
    `insert into app_settings (key, value) values ('app', $1)
     on conflict (key) do update set value = excluded.value`,
    [JSON.stringify(next)],
  );
  return next;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const settings = await getAppSettings();
  return {
    name: settings.name,
    tagline: settings.tagline,
    address: settings.address,
    hours: settings.hours,
    description: settings.description,
    logo: settings.logo,
    midtransConfigured: Boolean(process.env.MIDTRANS_SERVER_KEY || settings.midtransServerKey),
  };
}
