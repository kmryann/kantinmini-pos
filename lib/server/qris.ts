import QRCode from "qrcode";

// Verified static EMVCo merchant QRIS payload extracted from public/assets/qr/new-qris.jpeg.
// Can be overridden via QRIS_MERCHANT_PAYLOAD environment variable without redeploying assets.
const DEFAULT_MERCHANT_PAYLOAD =
  "00020101021126650013ID.CO.BCA.WWW011893600014000220405902150008850022040590303UMI51440014ID.CO.QRIS.WWW0215ID10233045203320303UMI5204581453033605802ID5911Kantin Mini6007BANDUNG61054026162070703A016304C345";

export const MAX_QRIS_AMOUNT = 50_000_000;

export const crc16 = (input: string) => {
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

export function getMerchantPayload(): string {
  const envPayload = process.env.QRIS_MERCHANT_PAYLOAD?.trim();
  const payload = envPayload || DEFAULT_MERCHANT_PAYLOAD;
  if (!payload.startsWith("000201") || !payload.includes("6304")) {
    throw new Error("Payload QRIS merchant tidak valid.");
  }
  return payload;
}

export function buildDynamicPayload(merchantPayload: string, amount: number) {
  const rounded = Math.round(Number(amount));
  if (!Number.isFinite(rounded) || rounded < 1 || rounded > MAX_QRIS_AMOUNT) {
    throw new Error("Nominal QRIS di luar batas yang diizinkan.");
  }
  const normalizedAmount = String(rounded);
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
  const merchantPayload = getMerchantPayload();
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
