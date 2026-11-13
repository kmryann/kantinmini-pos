import { access, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import jsQR from "jsqr";
import QRCode from "qrcode";

type GlobalQris = typeof globalThis & {
  __kantinQrisPayload?: Promise<string>;
};

const globalForQris = globalThis as GlobalQris;

const crc16 = (input: string) => {
  let crc = 0xffff;
  for (let index = 0; index < input.length; index += 1) {
    crc ^= input.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

interface TLVTag {
  tag: string;
  len: number;
  val: string;
}

function parseTLV(payload: string): TLVTag[] {
  const tags: TLVTag[] = [];
  let i = 0;
  while (i < payload.length) {
    const tag = payload.slice(i, i + 2);
    const len = parseInt(payload.slice(i + 2, i + 4), 10);
    if (isNaN(len) || i + 4 + len > payload.length) break;
    const val = payload.slice(i + 4, i + 4 + len);
    tags.push({ tag, len, val });
    i += 4 + len;
  }
  return tags;
}

async function decodeMerchantPayload() {
  const directory = path.join(process.cwd(), "public", "assets", "qr");
  const candidates = ["new-qris.jpeg"];
  let buffer: Buffer | null = null;
  for (const filename of candidates) {
    const file = path.join(directory, filename);
    try {
      await access(file);
      buffer = await readFile(file);
      break;
    } catch {
      // Try the next QR asset.
    }
  }
  if (!buffer) throw new Error("Aset QRIS tidak ditemukan.");
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  if (!decoded?.data || !decoded.data.startsWith("000201")) {
    throw new Error("QRIS merchant tidak dapat dibaca.");
  }
  return decoded.data;
}

export function getMerchantPayload() {
  if (!globalForQris.__kantinQrisPayload) {
    globalForQris.__kantinQrisPayload = decodeMerchantPayload().catch((error) => {
      globalForQris.__kantinQrisPayload = undefined;
      throw error;
    });
  }
  return globalForQris.__kantinQrisPayload;
}

export function buildDynamicPayload(merchantPayload: string, amount: number) {
  const normalizedAmount = String(Math.max(1, Math.round(Number(amount) || 0)));
  const marker = "6304";
  const markerIndex = merchantPayload.lastIndexOf(marker);
  if (markerIndex < 0) throw new Error("Payload QRIS tidak memiliki checksum.");

  const body = merchantPayload.slice(0, markerIndex);
  const tags = parseTLV(body);

  // Ubah Tag 01 dari '11' (Statis) menjadi '12' (Dinamis)
  for (const t of tags) {
    if (t.tag === "01") {
      t.val = "12";
      t.len = 2;
    }
  }

  // Sisipkan Tag 54 (Transaction Amount) sebelum Tag 58 (Country Code)
  const tag54: TLVTag = {
    tag: "54",
    len: normalizedAmount.length,
    val: normalizedAmount,
  };

  const filtered = tags.filter((t) => t.tag !== "54");
  const tag58Index = filtered.findIndex((t) => t.tag === "58");
  if (tag58Index >= 0) {
    filtered.splice(tag58Index, 0, tag54);
  } else {
    filtered.push(tag54);
  }

  let newBody = "";
  for (const t of filtered) {
    newBody += `${t.tag}${String(t.len).padStart(2, "0")}${t.val}`;
  }

  const payloadWithCrcMarker = `${newBody}${marker}`;
  return `${payloadWithCrcMarker}${crc16(payloadWithCrcMarker)}`;
}

export async function generateQrisPng(amount: number) {
  const merchantPayload = await getMerchantPayload();
  const dynamicPayload = buildDynamicPayload(merchantPayload, amount);
  return QRCode.toBuffer(dynamicPayload, {
    type: "png",
    width: 720,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#0e2a22",
      light: "#ffffff",
    },
  });
}
