"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { useCustomer } from "@/components/CustomerProvider";
import { useToast } from "@/components/ToastProvider";
import { KANTIN_DATA } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import {
  createOrderCode,
  createPaymentCode,
  saveActiveOrder,
  type ActiveOrder,
} from "@/lib/customer-storage";

export default function CheckoutPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const toast = useToast();
  const { cart, context, cartTotal, clearCart, updateLine } = useCustomer();
  const [name, setName] = useState("");
  const [method, setMethod] = useState<"QRIS" | "Cash">("QRIS");
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    document.title = `${t("checkout.title")} · Kantin Mini`;
  }, [lang, t]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    if (!cart.length) {
      toast(t("payment.emptyCart"), "error");
      return;
    }
    setNameError(false);
    const now = new Date();
    const order: ActiveOrder = {
      code: createOrderCode(),
      customer: name.trim(),
      type: context.type,
      table: context.table,
      items: cart.map((line) => ({
        menuId: line.menuId,
        qty: line.qty,
        options: line.options,
        note: line.note,
      })),
      total: cartTotal,
      payment: method,
      paymentStatus: "pending",
      orderStatus: "new",
      source: "QR",
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
      paymentCode: method === "Cash" ? createPaymentCode() : null,
    };
    saveActiveOrder(order);
    clearCart();
    toast(t("payment.created"));
    router.push("/status");
  };

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
                {cart.map((line) => {
                  const item = KANTIN_DATA.menuById(line.menuId);
                  if (!item) return null;
                  const options = KANTIN_DATA.orderItemSummary(line, lang);
                  return (
                    <div className="checkout-item" key={line.lineId}>
                      <div className="checkout-item-thumb">
                        <img src={item.image} alt={KANTIN_DATA.localized(item.name, lang)} width={800} height={800} decoding="async" />
                      </div>
                      <div className="checkout-item-copy">
                        <h3>{KANTIN_DATA.localized(item.name, lang)}</h3>
                        {options ? <p>{options}</p> : null}
                        {line.note ? <p className="cart-note">{t("cart.note")}: {line.note}</p> : null}
                        <div className="checkout-item-controls">
                          <div className="qty-stepper checkout-stepper">
                            <button
                              type="button"
                              aria-label="Kurangi jumlah"
                              disabled={line.qty <= 1}
                              onClick={() => updateLine(line.lineId, { qty: Math.max(1, line.qty - 1) })}
                            >
                              <Icon name="minus" />
                            </button>
                            <span>{line.qty}</span>
                            <button
                              type="button"
                              aria-label="Tambah jumlah"
                              onClick={() => updateLine(line.lineId, { qty: line.qty + 1 })}
                            >
                              <Icon name="plus" />
                            </button>
                          </div>
                          <strong className="checkout-item-price">{KANTIN_DATA.formatIDR(item.price * line.qty)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="payment-card">
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
                  <strong>{KANTIN_DATA.formatIDR(cartTotal)}</strong>
                </div>
                <button className="btn btn-primary" type="submit">{t("payment.pay")}</button>
              </div>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
