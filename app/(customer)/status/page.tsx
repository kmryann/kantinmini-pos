"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { useCustomer } from "@/components/CustomerProvider";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import type { Order } from "@/lib/api-types";
import { readActiveOrderRef } from "@/lib/customer-storage";
import { formatIDR, formatTime } from "@/lib/format";
import { localized, orderItemSummary } from "@/lib/order-utils";
import { useLanguage } from "@/lib/i18n";

const formatRemaining = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export default function StatusPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const { setContext } = useCustomer();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    document.title = "Status pesanan · Kantin Mini";
  }, [lang]);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    const ref = readActiveOrderRef();

    if (!ref) {
      setLoading(false);
      setOrder(null);
      return;
    }

    const load = async () => {
      try {
        const next = await api.customerOrder(ref.token);
        if (!active) return;
        setOrder(next);
        setRemaining(next.expiresAt ? new Date(next.expiresAt).getTime() - Date.now() : 0);
      } catch {
        if (!active) return;
        setOrder(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    timer = window.setInterval(load, 3000);
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!order) return;
    setContext({ type: order.type, table: order.table });
  }, [order, setContext]);

  useEffect(() => {
    if (!order || order.paymentStatus !== "pending" || !order.expiresAt) return;
    const tick = () => setRemaining(new Date(order.expiresAt as string).getTime() - Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [order]);

  const simulatePayment = async () => {
    const ref = readActiveOrderRef();
    if (!ref) return;
    try {
      const next = await api.simulatePayment(ref.token);
      setOrder(next);
      toast(t("status.statusUpdated"));
    } catch (error: any) {
      toast(error?.message || t("status.pending"), "error");
    }
  };

  const typeLabel = order
    ? order.type === "takeaway"
      ? t("status.takeaway")
      : `${t("status.table")} ${String(order.table || 1).padStart(2, "0")}`
    : "";
  const count = order?.items.reduce((sum, item) => sum + item.qty, 0) ?? 0;

  const steps = useMemo(
    () => [
      { id: "new", label: t("status.step1") },
      { id: "cooking", label: t("status.step2") },
      { id: "ready", label: t("status.step3") },
    ],
    [t],
  );

  if (loading) {
    return (
      <main className="cust-main cust-narrow cust-page">
        <div className="empty-state">
          <span className="empty-icon"><Icon name="refresh" /></span>
          <h2>{t("status.subtitle")}</h2>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="cust-main cust-narrow cust-page">
        <div className="empty-state">
          <span className="empty-icon"><Icon name="receipt" /></span>
          <h2>{t("status.empty")}</h2>
          <p>{t("status.emptyDesc")}</p>
          <Link className="btn btn-primary btn-sm" href="/order">
            <span>{t("status.viewMenu")}</span>
            <Icon name="arrow-right" />
          </Link>
        </div>
      </main>
    );
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

      {isPending || expired || cancelled ? (
        <div id="status-payment">
          {expired || cancelled ? (
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
                    <img src={order.qrUrl || "/assets/qr/qris-demo.svg"} width={320} height={320} alt="QRIS" />
                    <p>{t("status.qrisDesc")}</p>
                  </div>
                  <p className="pay-note" style={{ marginTop: 10 }}>{t("status.qrisPending")}</p>
                  {order.qrUrl === "/assets/qr/qris-demo.svg" ? (
                    <button className="btn btn-outline btn-sm" type="button" style={{ marginTop: 10 }} onClick={() => void simulatePayment()}>
                      {t("payment.demoPay")}
                    </button>
                  ) : null}
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
          {order.items.map((item, index) => (
            <div className="status-detail-line" key={`${item.menuId}-${index}`}>
              <span>
                {localized(item.name, lang)} × {item.qty}
                {orderItemSummary(item, lang) ? <em>{orderItemSummary(item, lang)}</em> : null}
                {item.note ? <em>{item.note}</em> : null}
              </span>
              <strong>{formatIDR(item.price * item.qty)}</strong>
            </div>
          ))}
          <div className="status-detail-line"><span>{t("status.customer")}</span><strong>{order.customer}</strong></div>
          <div className="status-detail-line"><span>{t("status.table")}</span><strong>{typeLabel}</strong></div>
          <div className="status-detail-line"><span>{t("status.orderedAt")}</span><strong>{formatTime(order.createdAt, lang)}</strong></div>
          <div className="status-detail-line"><span>{t("common.payment")}</span><strong>{order.payment} · {statusText}</strong></div>
          {order.paidAt ? <div className="status-detail-line"><span>{t("status.paidAt")}</span><strong>{formatTime(order.paidAt, lang)}</strong></div> : null}
          <div className="status-detail-line status-detail-total"><span>{t("status.total")}</span><strong>{formatIDR(order.total)}</strong></div>
        </div>
      </div>

      <p className="pay-note" style={{ marginTop: 12 }}>{t("status.needHelp")}</p>

      <div className="status-actions">
        <Link className="btn btn-primary" href="/order">{t("status.newOrder")}</Link>
        <Link className="btn btn-outline" href="/">{t("status.home")}</Link>
      </div>
    </main>
  );
}
