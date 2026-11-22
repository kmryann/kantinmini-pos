"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { useCustomer } from "@/components/CustomerProvider";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import type { PublicSettings } from "@/lib/api-types";
import { formatIDR } from "@/lib/format";
import { localized, orderItemSummary, optionLabelsFor } from "@/lib/order-utils";
import { useMenuData } from "@/lib/use-menu";
import { useModalBack } from "@/lib/use-modal-back";
import { useLanguage } from "@/lib/i18n";
import { createWhatsAppReference, saveActiveOrderRef, saveWhatsAppOrder } from "@/lib/customer-storage";

const nextTime = () => {
  const date = new Date(Date.now() + 30 * 60000);
  const minutes = Math.ceil(date.getMinutes() / 5) * 5;
  date.setMinutes(minutes, 0, 0);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const normalizeWhatsapp = (value: string) =>
  String(value || "").replace(/[^\d]/g, "").replace(/^0/, "62") || "6285117693117";

const FALLBACK_SETTINGS: PublicSettings = {
  name: "Kantin Mini",
  tagline: "Resep Rumahan, Rasa Juara.",
  address: "Gang Melong Kaler I no. 1",
  hours: "Senin–Jumat, 08.00–19.00",
  description: "",
  logo: "/assets/favicon.svg",
  orderMode: "whatsapp",
  whatsappNumber: "6285117693117",
  midtransConfigured: false,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const toast = useToast();
  const { cart, context, clearCart, updateLine, removeLine, setContext } = useCustomer();
  const { menuById, loading: menuLoading } = useMenuData();
  const [settings, setSettings] = useState<PublicSettings>(FALLBACK_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [name, setName] = useState("");
  const [method, setMethod] = useState<"QRIS" | "Cash">("QRIS");
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | null>(null);
  const [fulfillmentTime, setFulfillmentTime] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [typeError, setTypeError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrisOpen, setQrisOpen] = useState(false);

  useModalBack(qrisOpen, () => setQrisOpen(false));

  useEffect(() => {
    document.title = `${t("checkout.title")} · Kantin Mini`;
  }, [lang, t]);

  useEffect(() => {
    setFulfillmentTime(nextTime());
    api
      .settings()
      .then((next) => {
        setSettings(next);
        setSettingsLoaded(true);
      })
      .catch(() => {
        setSettings(FALLBACK_SETTINGS);
        setSettingsLoaded(true);
      });
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", qrisOpen);
    return () => document.body.classList.remove("modal-open");
  }, [qrisOpen]);

  const isWhatsapp = settings.orderMode === "whatsapp";
  const typeLabel =
    orderType === "takeaway"
      ? t("common.takeaway")
      : orderType === "dine-in"
        ? t("common.dineIn")
        : "";
  const timeLabel =
    orderType === "takeaway"
      ? (lang === "id" ? "Jam ambil" : "Pickup time")
      : orderType === "dine-in"
        ? (lang === "id" ? "Jam tiba" : "Arrival time")
        : (lang === "id" ? "Jam ambil / tiba" : "Pickup / arrival time");

  const itemLines = useMemo(
    () =>
      cart.map((line) => {
        const item = menuById(line.menuId);
        const nameValue = item?.name || line.name;
        const price = Number(item?.price ?? line.price ?? 0);
        const options = line.optionLabels?.length
          ? orderItemSummary({ optionLabels: line.optionLabels }, lang)
          : item
            ? optionLabelsFor(item, line.options).map((label) => localized(label, lang)).join(" · ")
            : "";
        return {
          menuId: line.menuId,
          qty: line.qty,
          options: line.options,
          note: line.note,
          name: nameValue,
          price,
          optionsLabel: options,
        };
      }),
    [cart, menuById, lang],
  );

  const checkoutTotal = useMemo(
    () => itemLines.reduce((sum, line) => sum + line.price * line.qty, 0),
    [itemLines],
  );

  const validate = () => {
    let valid = true;
    if (!orderType) {
      setTypeError(true);
      valid = false;
    }
    if (!name.trim()) {
      setNameError(true);
      valid = false;
    }
    if (!fulfillmentTime) {
      setTimeError(true);
      valid = false;
    }
    if (!cart.length) {
      toast(t("payment.emptyCart"), "error");
      valid = false;
    }
    if (!valid && cart.length) {
      const targetId = !orderType
        ? "checkout-order-type"
        : !fulfillmentTime
          ? "checkout-time"
          : "checkout-name";
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return valid;
  };

  const sendToWhatsapp = () => {
    if (!validate() || !orderType) {
      setQrisOpen(false);
      return;
    }
    const number = normalizeWhatsapp(settings.whatsappNumber || "6285117693117");
    const reference = createWhatsAppReference();
    const lines = itemLines.map((line) => {
      const extras = [
        line.optionsLabel ? ` (${line.optionsLabel})` : "",
        line.note ? ` — ${line.note}` : "",
      ].join("");
      return `- ${line.qty}x ${localized(line.name, lang)}${extras} (${formatIDR(line.price * line.qty)})`;
    });
    const paymentLine =
      method === "QRIS"
        ? "Pembayaran: QRIS (sudah bayar, bukti transfer menyusul)"
        : "Pembayaran: Cash";
    const message = [
      "Halo Kantin Mini!",
      `Ref: ${reference}`,
      `Nama: ${name.trim()}`,
      `Tipe pesanan: ${typeLabel}`,
      `${timeLabel}: ${fulfillmentTime}`,
      paymentLine,
      "",
      "Pesanan:",
      ...lines,
      "",
      `Total: ${formatIDR(checkoutTotal)}`,
      `Catatan: ${orderNote.trim() || "-"}`,
      ...(method === "QRIS"
        ? ["", "(Mohon lampirkan screenshot bukti pembayaran QRIS di chat ini)"]
        : []),
    ].join("\n");
    const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    saveWhatsAppOrder({
      reference,
      customer: name.trim(),
      type: orderType,
      time: fulfillmentTime,
      payment: method,
      paymentClaimed: method === "QRIS",
      note: orderNote.trim(),
      total: checkoutTotal,
      items: itemLines.map((line) => ({
        menuId: line.menuId,
        name: line.name || { id: line.menuId, en: line.menuId },
        qty: line.qty,
        price: line.price,
        optionsLabel: line.optionsLabel,
        note: line.note,
      })),
      createdAt: new Date().toISOString(),
      waUrl,
    });
    window.location.assign("/whatsapp-status?send=1");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate() || !orderType) return;
    setTypeError(false);
    setNameError(false);
    setTimeError(false);

    if (isWhatsapp) {
      if (method === "QRIS") {
        setQrisOpen(true);
      } else {
        sendToWhatsapp();
      }
      return;
    }

    if (menuLoading) {
      toast(lang === "id" ? "Menu masih dimuat." : "Menu is still loading.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customer: name.trim(),
        type: orderType,
        table: orderType === "dine-in" ? context.table : null,
        items: cart.map((line) => ({
          menuId: line.menuId,
          qty: line.qty,
          options: line.options,
          note: line.note,
        })),
        payment: method,
        note: orderNote.trim(),
        fulfillmentTime,
      });
      if (!order.publicToken) throw new Error("Token pesanan tidak diterima.");
      saveActiveOrderRef({ id: order.id, code: order.code, token: order.publicToken });
      clearCart();
      toast(t("payment.created"));
      router.push("/status");
    } catch (error: any) {
      toast(error?.message || t("payment.emptyCart"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const primaryLabel = submitting
    ? (lang === "id" ? "Memproses…" : "Processing…")
    : isWhatsapp
      ? method === "QRIS"
        ? (lang === "id" ? "Lanjut ke QRIS" : "Continue to QRIS")
        : (lang === "id" ? "Pesan via WhatsApp" : "Order via WhatsApp")
      : t("payment.pay");

  return (
    <main className="cust-main cust-narrow cust-page checkout-page">
      {cart.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><Icon name="cart" /></span>
          <h2>{t("cart.empty")}</h2>
          <p>{t("cart.emptyDesc")}</p>
          <Link className="btn btn-primary btn-sm" href="/order">
            <span>{t("cart.browse")}</span>
            <Icon name="arrow-right" />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 mb-4">
            <Link className="back-link" href="/order" aria-label={t("common.back")}>
              <Icon name="arrow-left" />
            </Link>
            <span className="cell-muted">{t("cart.itemCount", { count: cart.reduce((sum, line) => sum + line.qty, 0) })}</span>
          </div>

          <form className="checkout-form" onSubmit={submit} noValidate>
            <section className="payment-card checkout-summary-card">
              <h2><Icon name="receipt" /><span>{t("payment.summary")}</span></h2>
              <div className="checkout-item-list">
                {itemLines.map((line, index) => (
                  <div className="checkout-item" key={cart[index].lineId}>
                    <div className="checkout-item-thumb">
                      <img src={cart[index].image || menuById(line.menuId)?.image || "/assets/menu/placeholder.webp"} alt={localized(line.name, lang)} width={800} height={800} decoding="async" />
                    </div>
                    <div className="checkout-item-copy">
                      <h3>{localized(line.name, lang)}</h3>
                      {line.optionsLabel ? <p>{line.optionsLabel}</p> : null}
                      {line.note ? <p className="cart-note">{t("cart.note")}: {line.note}</p> : null}
                      <div className="checkout-item-controls">
                        <div className="qty-stepper checkout-stepper">
                          <button
                            type="button"
                            aria-label="Kurangi jumlah"
                            onClick={() => {
                              if (line.qty > 1) {
                                updateLine(cart[index].lineId, { qty: line.qty - 1 });
                              } else {
                                removeLine(cart[index].lineId);
                                toast(t("cart.removed"));
                              }
                            }}
                          >
                            <Icon name="minus" />
                          </button>
                          <span>{line.qty}</span>
                          <button
                            type="button"
                            aria-label="Tambah jumlah"
                            onClick={() => updateLine(cart[index].lineId, { qty: line.qty + 1 })}
                          >
                            <Icon name="plus" />
                          </button>
                        </div>
                        <strong className="checkout-item-price">{formatIDR(line.price * line.qty)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="payment-card" id="checkout-order-type">
              <h2><Icon name="bag" /><span>{lang === "id" ? "Detail pesanan" : "Order details"}</span></h2>
              <div className="checkout-service-options" role="group" aria-label={lang === "id" ? "Tipe pesanan" : "Order type"}>
                {(["dine-in", "takeaway"] as const).map((value) => (
                  <button
                    key={value}
                    className={`checkout-service-btn ${orderType === value ? "is-selected" : ""}`}
                    type="button"
                    aria-pressed={orderType === value}
                    onClick={() => {
                      setOrderType(value);
                      setTypeError(false);
                      setContext({ type: value, table: value === "takeaway" ? null : context.table });
                    }}
                  >
                    <Icon name={value === "takeaway" ? "bag" : "utensils"} />
                    <span>{value === "takeaway" ? t("common.takeaway") : t("common.dineIn")}</span>
                  </button>
                ))}
              </div>
              {typeError ? (
                <span className="field-error is-visible" style={{ marginTop: 8 }}>
                  {lang === "id" ? "Pilih tipe pesanan terlebih dahulu." : "Please select an order type."}
                </span>
              ) : null}
              <div className="pay-field" style={{ marginTop: 14 }}>
                <label htmlFor="checkout-time">{timeLabel}</label>
                <input
                  className="input"
                  id="checkout-time"
                  type="time"
                  value={fulfillmentTime}
                  onChange={(event) => {
                    setFulfillmentTime(event.target.value);
                    if (event.target.value) setTimeError(false);
                  }}
                  required
                />
                {timeError ? <span className="field-error is-visible">{lang === "id" ? "Jam wajib diisi." : "Time is required."}</span> : null}
              </div>
              <div className="pay-field" style={{ marginTop: 14 }}>
                <label htmlFor="checkout-note">{lang === "id" ? "Catatan (opsional)" : "Note (optional)"}</label>
                <textarea
                  className="note-field"
                  id="checkout-note"
                  value={orderNote}
                  onChange={(event) => setOrderNote(event.target.value)}
                  placeholder={lang === "id" ? "Contoh: tidak pedas, tanpa es" : "Example: not spicy, no ice"}
                  maxLength={300}
                />
              </div>
            </section>

            <section className="payment-card" id="checkout-name">
              <h2><Icon name="user" /><span>{t("payment.name")}</span></h2>
              <div className="pay-field">
                <input
                  className="input"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (event.target.value.trim()) setNameError(false);
                  }}
                  aria-label={t("payment.name")}
                  placeholder={t("payment.namePlaceholder")}
                  maxLength={60}
                />
                {nameError ? <span className="field-error is-visible">{t("payment.nameRequired")}</span> : null}
              </div>
            </section>

            <section className="payment-card">
              <h2><Icon name="wallet" /><span>{t("payment.method")}</span></h2>
              <div className="pay-methods" role="radiogroup" aria-label={t("payment.method")}>
                {(["QRIS", "Cash"] as const).map((value) => (
                  <button
                    className={`pay-method ${method === value ? "is-selected" : ""}`}
                    type="button"
                    role="radio"
                    aria-checked={method === value}
                    key={value}
                    onClick={() => setMethod(value)}
                  >
                    <span className="pay-method-icon"><Icon name={value === "QRIS" ? "qr" : "banknote"} /></span>
                    <span className="pay-method-copy">
                      <strong>{value === "QRIS" ? t("payment.qris") : t("payment.cash")}</strong>
                      <small>{value === "QRIS" ? t("payment.qrisDesc") : t("payment.cashDesc")}</small>
                    </span>
                    <span className="pay-method-radio" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>

            <div className="checkout-bar">
              <div className="bar-inner">
                <div className="checkout-bar-copy">
                  <small>{t("cart.total")}</small>
                  <strong>{formatIDR(checkoutTotal)}</strong>
                </div>
                <button className="btn btn-primary" type="submit" disabled={submitting || !settingsLoaded}>
                  {!settingsLoaded ? (lang === "id" ? "Memuat…" : "Loading…") : primaryLabel}
                </button>
              </div>
            </div>
          </form>
        </>
      )}

      {qrisOpen ? (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="checkout-qris-title">
          <div className="modal-card checkout-qris-modal">
            <div className="modal-head">
              <div>
                <h2 id="checkout-qris-title">{lang === "id" ? "Pembayaran QRIS" : "QRIS payment"}</h2>
                <p>{lang === "id" ? "Pindai QRIS, lalu tekan tombol setelah membayar." : "Scan the QRIS, then confirm once paid."}</p>
              </div>
              <button className="icon-btn" type="button" aria-label={t("common.close")} onClick={() => setQrisOpen(false)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              <div className="checkout-qris-box">
                <p className="checkout-qris-merchant">{settings.name || "Kantin Mini"}</p>
                <img
                  src={`/api/qris?amount=${checkoutTotal}`}
                  alt="QRIS Kantin Mini"
                  width={800}
                  height={800}
                  decoding="async"
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallback) return;
                    event.currentTarget.dataset.fallback = "1";
                    event.currentTarget.src = "/assets/qr/new-qris.jpeg";
                  }}
                />
                <strong>{formatIDR(checkoutTotal)}</strong>
                <p>{t("status.qrisDesc")}</p>
              </div>
              <p className="checkout-qris-hint">
                {lang === "id"
                  ? "Setelah membayar, simpan screenshot bukti transfer lalu lampirkan saat chat WhatsApp terbuka."
                  : "After paying, save a screenshot of your payment receipt and attach it when WhatsApp opens."}
              </p>
            </div>
            <div className="modal-foot">
              <a
                className="btn btn-outline"
                href={`/api/qris?amount=${checkoutTotal}&download=1`}
                download={`qris-kantinmini-${checkoutTotal}.png`}
              >
                <Icon name="download" />
                <span>{lang === "id" ? "Unduh QR" : "Download QR"}</span>
              </a>
              <button className="btn btn-primary" type="button" onClick={sendToWhatsapp}>
                {lang === "id" ? "Saya sudah bayar" : "I have paid"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
