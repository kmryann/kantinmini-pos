"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  readWhatsAppOrder,
  type WhatsAppOrderSnapshot,
} from "@/lib/customer-storage";
import { formatDate, formatIDR, formatTime } from "@/lib/format";
import { localized } from "@/lib/order-utils";
import { useLanguage } from "@/lib/i18n";

export default function WhatsAppStatusPage() {
  const { t, lang } = useLanguage();
  const [order, setOrder] = useState<WhatsAppOrderSnapshot | null>(null);
  const redirected = useRef(false);

  useEffect(() => {
    document.title = `${lang === "id" ? "Status WhatsApp" : "WhatsApp status"} · Kantin Mini`;
    setOrder(readWhatsAppOrder());
  }, [lang]);

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
            ? "Pesanan siap dikirim."
            : "Your order is ready to send."}
        </h2>
        <p>
          {lang === "id"
            ? "Ringkasan pesanan tersimpan di halaman ini. Kirim ke WhatsApp kantin agar pesanan diproses."
            : "Your order summary is saved here. Send it to the canteen WhatsApp to process it."}
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
        <Link className="btn btn-outline" href="/order">{t("status.newOrder")}</Link>
      </div>

      <p className="pay-note" style={{ marginTop: 12 }}>
        {lang === "id"
          ? "Halaman ini tetap bisa dibuka kembali untuk melihat ringkasan pesanan WhatsApp terakhir."
          : "You can return to this page to view your latest WhatsApp order summary."}
      </p>
    </main>
  );
}
