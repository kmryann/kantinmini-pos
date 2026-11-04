"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { useCustomer } from "@/components/CustomerProvider";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import { formatIDR } from "@/lib/format";
import { localized, orderItemSummary, optionLabelsFor } from "@/lib/order-utils";
import { useMenuData } from "@/lib/use-menu";
import { useLanguage } from "@/lib/i18n";
import { saveActiveOrderRef } from "@/lib/customer-storage";

export default function CheckoutPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const toast = useToast();
  const { cart, context, cartTotal, clearCart, updateLine } = useCustomer();
  const { menuById, loading: menuLoading } = useMenuData();
  const [name, setName] = useState("");
  const [method, setMethod] = useState<"QRIS" | "Cash">("QRIS");
  const [nameError, setNameError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = `${t("checkout.title")} · Kantin Mini`;
  }, [lang, t]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    if (!cart.length) {
      toast(t("payment.emptyCart"), "error");
      return;
    }
    if (menuLoading) {
      toast(lang === "id" ? "Menu masih dimuat." : "Menu is still loading.", "error");
      return;
    }
    setNameError(false);
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customer: name.trim(),
        type: context.type,
        table: context.type === "dine-in" ? context.table : null,
        items: cart.map((line) => ({
          menuId: line.menuId,
          qty: line.qty,
          options: line.options,
          note: line.note,
        })),
        payment: method,
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
                  const item = menuById(line.menuId);
                  const name = line.name || item?.name;
                  const image = line.image || item?.image || "/assets/menu/placeholder.webp";
                  const price = Number(line.price ?? item?.price ?? 0);
                  const options = line.optionLabels?.length
                    ? orderItemSummary({ optionLabels: line.optionLabels }, lang)
                    : item
                      ? optionLabelsFor(item, line.options).map((label) => localized(label, lang)).join(" · ")
                      : "";
                  return (
                    <div className="checkout-item" key={line.lineId}>
                      <div className="checkout-item-thumb">
                        <img src={image} alt={localized(name, lang)} width={800} height={800} decoding="async" />
                      </div>
                      <div className="checkout-item-copy">
                        <h3>{localized(name, lang)}</h3>
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
                          <strong className="checkout-item-price">{formatIDR(price * line.qty)}</strong>
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
                  <strong>{formatIDR(cartTotal)}</strong>
                </div>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? (lang === "id" ? "Memproses…" : "Processing…") : t("payment.pay")}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
