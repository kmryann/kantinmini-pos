"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { useCustomer } from "@/components/CustomerProvider";
import { useToast } from "@/components/ToastProvider";
import { KANTIN_DATA } from "@/lib/data";
import { formatTime } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { readActiveOrder, saveActiveOrder, type ActiveOrder } from "@/lib/customer-storage";

const formatRemaining = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const demoOrder = (): ActiveOrder => {
  const items = [
    { menuId: "nasi-ayam", qty: 1, options: ["matah", "pedas"], note: "Tanpa telur" },
    { menuId: "es-teh", qty: 1, options: [], note: "" },
  ];
  return {
    code: "A-012",
    customer: "Dinda",
    type: "dine-in",
    table: 3,
    items,
    total: KANTIN_DATA.orderTotal(items),
    payment: "QRIS",
    paymentStatus: "paid",
    orderStatus: "cooking",
    source: "QR",
    createdAt: new Date(Date.now() - 9 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 21 * 60000).toISOString(),
    paymentCode: null,
  };
};

export default function StatusPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const { setContext } = useCustomer();
  const [order, setOrder] = useState<ActiveOrder | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    document.title = "Status pesanan · Kantin Mini";
    const active = readActiveOrder();
    if (active) {
      setIsDemo(false);
      setRemaining(new Date(active.expiresAt).getTime() - Date.now());
      setOrder(active);
    } else {
      const demo = demoOrder();
      setIsDemo(true);
      setDemoOpen(true);
      setRemaining(new Date(demo.expiresAt).getTime() - Date.now());
      setOrder(demo);
    }
  }, []);

  useEffect(() => {
    if (!order) return;
    setContext({ type: order.type, table: order.table });
  }, [order, setContext]);

  useEffect(() => {
    if (!order || order.paymentStatus !== "pending") return;
    const tick = () => {
      const left = new Date(order.expiresAt).getTime() - Date.now();
      setRemaining(left);
      if (left <= 0) {
        const expired = { ...order, paymentStatus: "expired" as const };
        if (!isDemo) saveActiveOrder(expired);
        setOrder(expired);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [order, isDemo]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "kantin-active-order") return;
      const active = readActiveOrder();
      if (!active) return;
      setIsDemo(false);
      setOrder(active);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateOrder = (patch: Partial<ActiveOrder>) => {
    if (!order) return;
    const next = { ...order, ...patch } as ActiveOrder;
    saveActiveOrder(next);
    setIsDemo(false);
    setOrder(next);
    toast(t("status.statusUpdated"));
  };

  const typeLabel =
    order?.type === "takeaway"
      ? t("status.takeaway")
      : `${t("status.table")} ${String(order?.table || 1).padStart(2, "0")}`;
  const count = order?.items.reduce((sum, item) => sum + item.qty, 0) ?? 0;

  const steps = useMemo(
    () => [
      { id: "new", label: t("status.step1") },
      { id: "cooking", label: t("status.step2") },
      { id: "ready", label: t("status.step3") },
    ],
    [t],
  );

  if (!order) {
    return <main className="cust-main cust-narrow cust-page" />;
  }

  const activeIndex = steps.findIndex((step) => step.id === order.orderStatus);
  const noActive = order.paymentStatus === "expired" || order.paymentStatus === "cancelled";
  const expired = order.paymentStatus === "expired";
  const cancelled = order.paymentStatus === "cancelled";
  const isPending = order.paymentStatus === "pending";
  const statusText = order.paymentStatus === "paid"
    ? t("status.paid")
    : expired
      ? t("status.expired")
      : cancelled
        ? t("status.cancelled")
        : t("status.pending");

  return (
    <main className="cust-main cust-narrow cust-page">
      <div className="status-hero">
        <div className="status-hero-top">
          <div>
            <p className="status-code-label">{t("status.orderCode")}</p>
            <p className="status-code">{order.code}</p>
            <div className="status-context">
              <span><Icon name="user" />{order.customer}</span>
              <span><Icon name="pin" />{typeLabel}</span>
              <span><Icon name="clock" />{formatTime(order.createdAt, lang)}</span>
            </div>
          </div>
          <div className="status-hero-side">
            <span className={`badge ${order.paymentStatus === "paid" ? "badge-paid" : expired ? "badge-expired" : cancelled ? "badge-cancelled" : "badge-pending"}`}>
              <Icon name={order.paymentStatus === "paid" ? "check" : expired ? "alert" : cancelled ? "x-circle" : "clock"} />
              <span>{statusText}</span>
            </span>
            <span className="status-live-pill"><i /><span>{t("status.realtime")}</span></span>
          </div>
        </div>

        <div className="status-steps">
          {steps.map((step, index) => {
            const done = !noActive && activeIndex >= 0 && index < activeIndex;
            const active = !noActive && index === activeIndex;
            return (
              <div key={step.id} style={{ display: "contents" }}>
                {index > 0 ? <span className={`status-step-line ${!noActive && index <= activeIndex ? "is-done" : ""}`} /> : null}
                <div className={`status-step ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
                  <span className="status-step-dot">{done ? <Icon name="check" /> : null}</span>
                  <span>{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isDemo ? (
        <div className="cust-note">
          <Icon name="clock" />
          <span>{t("status.demoDesc")}</span>
        </div>
      ) : null}

      {!order.paymentStatus || isPending || expired || cancelled ? (
        <div id="status-payment">
          {order.paymentStatus === "paid" ? null : expired || cancelled ? (
            <div className="status-payment-card">
              <h2>{t("status.paymentSection")}</h2>
              <div className="expired-box is-visible">
                <span className="empty-icon"><Icon name={cancelled ? "x-circle" : "alert"} /></span>
                <h3>{cancelled ? t("status.cancelled") : t("status.expired")}</h3>
                <p>{cancelled ? t("status.cancelledDesc") : t("status.expiredDesc")}</p>
                <Link className="btn btn-primary btn-sm" href="/order">{t("status.newOrder")}</Link>
              </div>
            </div>
          ) : (
            <div className="status-payment-card">
              <h2>
                <span>{t("status.paymentSection")}</span>
                <span className={`countdown ${remaining < 5 * 60 * 1000 ? "is-urgent" : ""}`}>
                  <Icon name="clock" />
                  <span>{formatRemaining(remaining)}</span>
                </span>
              </h2>
              {order.payment === "Cash" ? (
                <>
                  <div className="cash-code-box">
                    <span>{t("status.cashTitle")}</span>
                    <strong>{order.paymentCode || "----"}</strong>
                    <p>{t("status.cashDesc")}</p>
                  </div>
                  <p className="pay-note" style={{ marginTop: 10 }}>{t("status.cashPending")}</p>
                </>
              ) : (
                <>
                  <div className="qris-box">
                    <img src="/assets/qr/qris-demo.svg" width={320} height={320} alt="QRIS demo" />
                    <p>{t("status.qrisDesc")}</p>
                  </div>
                  <p className="pay-note" style={{ marginTop: 10 }}>{t("status.qrisPending")}</p>
                </>
              )}
            </div>
          )}
        </div>
      ) : null}

      <div className="status-details">
        <div className="status-details-head">
          <h2>{t("status.details")}</h2>
          <span>{t("common.items", { count })}</span>
        </div>
        <div className="status-detail-list">
          {order.items.map((item, index) => {
            const menu = KANTIN_DATA.menuById(item.menuId);
            if (!menu) return null;
            const options = KANTIN_DATA.orderItemSummary(item, lang);
            return (
              <div className="status-detail-line" key={`${item.menuId}-${index}`}>
                <span>
                  {KANTIN_DATA.localized(menu.name, lang)} × {item.qty}
                  {options ? <em>{options}</em> : null}
                  {item.note ? <em>{item.note}</em> : null}
                </span>
                <strong>{KANTIN_DATA.formatIDR(menu.price * item.qty)}</strong>
              </div>
            );
          })}
          <div className="status-detail-line"><span>{t("status.customer")}</span><strong>{order.customer}</strong></div>
          <div className="status-detail-line"><span>{t("status.table")}</span><strong>{typeLabel}</strong></div>
          <div className="status-detail-line"><span>{t("status.orderedAt")}</span><strong>{formatTime(order.createdAt, lang)}</strong></div>
          <div className="status-detail-line"><span>{t("common.payment")}</span><strong>{order.payment} · {statusText}</strong></div>
          {order.paidAt ? <div className="status-detail-line"><span>{t("status.paidAt")}</span><strong>{formatTime(order.paidAt, lang)}</strong></div> : null}
          <div className="status-detail-line status-detail-total"><span>{t("status.total")}</span><strong>{KANTIN_DATA.formatIDR(order.total)}</strong></div>
        </div>
      </div>

      <p className="pay-note" style={{ marginTop: 12 }}>{t("status.needHelp")}</p>

      <div className="status-actions">
        <Link className="btn btn-primary" href="/order">{t("status.newOrder")}</Link>
        <Link className="btn btn-outline" href="/">{t("status.home")}</Link>
      </div>

      <details
        className="status-demo"
        open={demoOpen}
        onToggle={(event) => setDemoOpen(event.currentTarget.open)}
      >
        <summary>{t("status.demo")}</summary>
        <p className="status-demo-note">{t("status.demoNote")}</p>
        <div className="status-demo-row">
          <button className="btn btn-sm btn-outline" type="button" onClick={() => updateOrder({ orderStatus: "new" })}>{t("status.step1")}</button>
          <button className="btn btn-sm btn-outline" type="button" onClick={() => updateOrder({ orderStatus: "cooking" })}>{t("status.step2")}</button>
          <button className="btn btn-sm btn-outline" type="button" onClick={() => updateOrder({ orderStatus: "ready" })}>{t("status.step3")}</button>
          <button className="btn btn-sm btn-outline" type="button" disabled={!isPending} onClick={() => updateOrder({ paymentStatus: "paid", paidAt: new Date().toISOString() })}>{t("status.markPaid")}</button>
        </div>
      </details>
    </main>
  );
}
