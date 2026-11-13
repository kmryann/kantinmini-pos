"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useCustomer } from "@/components/CustomerProvider";
import { api } from "@/lib/api-client";
import type { PublicSettings } from "@/lib/api-types";
import {
  readWhatsAppOrder,
  type WhatsAppOrderSnapshot,
} from "@/lib/customer-storage";
import { formatDate, formatIDR, formatTime } from "@/lib/format";
import { localized } from "@/lib/order-utils";
import { useLanguage } from "@/lib/i18n";

export default function WhatsAppStatusPage() {
  const { t, lang } = useLanguage();
  const { clearCart } = useCustomer();
  const [order, setOrder] = useState<WhatsAppOrderSnapshot | null>(null);
  const [site, setSite] = useState<PublicSettings | null>(null);
  const redirected = useRef(false);

  useEffect(() => {
    document.title = `${lang === "id" ? "Status WhatsApp" : "WhatsApp status"} · Kantin Mini`;
    const saved = readWhatsAppOrder();
    setOrder(saved);
    if (saved) clearCart();
    api.settings().then(setSite).catch(() => setSite(null));
  }, [lang, clearCart]);

  useEffect(() => {
    if (!order || redirected.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("send") !== "1") return;
    redirected.current = true;
    window.history.replaceState({}, "", window.location.pathname);
    window.location.assign(order.waUrl);
  }, [order]);

  if (!order) {
    return (
      <main className="cust-main cust-narrow cust-page">
        <div className="empty-state">
          <span className="empty-icon"><Icon name="whatsapp" /></span>
          <h2>{lang === "id" ? "Belum ada pesanan WhatsApp" : "No WhatsApp order yet"}</h2>
          <p>
            {lang === "id"
              ? "Pesan dari menu, lalu kirim pesanan melalui WhatsApp."
              : "Order from the menu, then send your order through WhatsApp."}
          </p>
          <Link className="btn btn-primary btn-sm" href="/order">
            <span>{t("cart.browse")}</span>
            <Icon name="arrow-right" />
          </Link>
        </div>
      </main>
    );
  }

  const typeLabel = order.type === "takeaway" ? t("common.takeaway") : t("common.dineIn");
  const timeLabel = order.type === "takeaway"
    ? (lang === "id" ? "Jam ambil" : "Pickup time")
    : (lang === "id" ? "Jam tiba" : "Arrival time");
  const paymentLabel = order.payment === "QRIS"
    ? (order.paymentClaimed
      ? (lang === "id" ? "QRIS · sudah dibayar" : "QRIS · marked paid")
      : "QRIS")
    : (lang === "id" ? "Cash · bayar saat datang" : "Cash · pay on arrival");
  const count = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <main className="cust-main cust-narrow cust-page wa-status-page">
      <section className="wa-status-hero">
        <span className="wa-status-mark"><Icon name="whatsapp" /></span>
        <p className="wa-status-kicker">{lang === "id" ? "Pesanan WhatsApp" : "WhatsApp order"}</p>
        <h2>
          {lang === "id"
            ? "Pesanan berhasil dibuat."
            : "Your order has been created."}
        </h2>
        <p>
          {lang === "id"
            ? "Ringkasan pesanan sudah tersimpan. Lanjutkan ke WhatsApp untuk mengirimkannya ke kantin."
            : "Your order summary is saved. Continue to WhatsApp to send it to the canteen."}
        </p>
        <span className="wa-status-ref">{order.reference}</span>
      </section>

      <div className="status-details wa-status-details">
        <div className="status-details-head">
          <h2>{t("status.details")}</h2>
          <span>{t("common.items", { count })}</span>
        </div>
        <div className="status-detail-list">
          {order.items.map((item, index) => (
            <div className="status-detail-line" key={`${item.menuId}-${index}`}>
              <span>
                {localized(item.name, lang)} × {item.qty}
                {item.optionsLabel ? <em>{item.optionsLabel}</em> : null}
                {item.note ? <em>{item.note}</em> : null}
              </span>
              <strong>{formatIDR(item.price * item.qty)}</strong>
            </div>
          ))}
          <div className="status-detail-line"><span>{t("status.customer")}</span><strong>{order.customer}</strong></div>
          <div className="status-detail-line"><span>{lang === "id" ? "Tipe pesanan" : "Order type"}</span><strong>{typeLabel}</strong></div>
          <div className="status-detail-line"><span>{timeLabel}</span><strong>{order.time}</strong></div>
          <div className="status-detail-line"><span>{t("common.payment")}</span><strong>{paymentLabel}</strong></div>
          {order.note ? <div className="status-detail-line"><span>{t("common.notes")}</span><strong>{order.note}</strong></div> : null}
          <div className="status-detail-line"><span>{lang === "id" ? "Dibuat" : "Created"}</span><strong>{formatDate(order.createdAt, lang, { day: "numeric", month: "short" })} · {formatTime(order.createdAt, lang)}</strong></div>
          <div className="status-detail-line status-detail-total"><span>{t("status.total")}</span><strong>{formatIDR(order.total)}</strong></div>
        </div>
      </div>

      <div className="status-actions">
        <a className="btn btn-primary" href={order.waUrl}>
          <Icon name="whatsapp" />
          <span>{lang === "id" ? "Buka WhatsApp" : "Open WhatsApp"}</span>
        </a>
        {order.payment === "QRIS" ? (
          <a className="btn btn-outline" href={`/api/qris?amount=${order.total}&download=1`} download={`qris-kantinmini-${order.total}.png`}>
            <Icon name="download" />
            <span>{lang === "id" ? "Unduh QR" : "Download QR"}</span>
          </a>
        ) : null}
        <button className="btn btn-outline" type="button" onClick={() => window.print()}>
          <Icon name="printer" />
          <span>{t("status.print")}</span>
        </button>
        <Link className="btn btn-outline" href="/order">{t("status.newOrder")}</Link>
      </div>

      <div className="receipt-print print-area" aria-hidden="true">
        <div className="receipt-paper" data-width="80">
          <h4>{site?.name || "Kantin Mini"}</h4>
          <p className="receipt-sub">{site?.address || "Jl. Melati No. 8, Gedung A, Lantai 1"}</p>
          <p className="receipt-sub">{t("receipt.customer")}</p>
          <hr />
          <div className="receipt-line"><span>{lang === "id" ? "Referensi" : "Reference"}</span><span>{order.reference}</span></div>
          <div className="receipt-line"><span>{t("label.type")}</span><span>{typeLabel}</span></div>
          <div className="receipt-line"><span>{t("label.customer")}</span><span>{order.customer}</span></div>
          <div className="receipt-line"><span>{timeLabel}</span><span>{order.time}</span></div>
          <div className="receipt-line"><span>{lang === "id" ? "Dibuat" : "Created"}</span><span>{formatDate(order.createdAt, lang, { day: "numeric", month: "short" })} · {formatTime(order.createdAt, lang)}</span></div>
          <hr />
          {order.items.map((item, index) => (
            <div className="receipt-line" key={`${item.menuId}-print-${index}`}>
              <span>
                {localized(item.name, lang)} × {item.qty}
                {item.optionsLabel ? <><br /><small>{item.optionsLabel}</small></> : null}
                {item.note ? <><br /><small>{item.note}</small></> : null}
              </span>
              <span>{formatIDR(item.price * item.qty)}</span>
            </div>
          ))}
          <hr />
          <div className="receipt-total-line"><span>{t("label.total")}</span><span>{formatIDR(order.total)}</span></div>
          <div className="receipt-line"><span>{order.payment}</span><span>{paymentLabel}</span></div>
          {order.note ? <div className="receipt-line"><span>{t("common.notes")}</span><span>{order.note}</span></div> : null}
          <hr />
          <p className="receipt-thanks">{t("receipt.thankYou")}</p>
        </div>
      </div>

      <p className="pay-note" style={{ marginTop: 12 }}>
        {lang === "id"
          ? "Halaman ini tetap bisa dibuka kembali untuk melihat ringkasan pesanan WhatsApp terakhir."
          : "You can return to this page to view your latest WhatsApp order summary."}
      </p>
    </main>
  );
}
