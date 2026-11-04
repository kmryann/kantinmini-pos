"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/Icon";
import { useCustomer } from "@/components/CustomerProvider";
import { useToast } from "@/components/ToastProvider";
import { KANTIN_DATA } from "@/lib/data";
import { localized, orderItemSummary } from "@/lib/order-utils";
import { useLanguage } from "@/lib/i18n";

export function CartDrawer() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const { cart, cartOpen, cartTotal, closeCart, updateLine, removeLine } = useCustomer();
  const itemCount = cart.reduce((sum, line) => sum + line.qty, 0);

  useEffect(() => {
    document.body.classList.toggle("cart-open", cartOpen);
    return () => document.body.classList.remove("cart-open");
  }, [cartOpen]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cartOpen, closeCart]);

  return (
    <div
      className={`cart-drawer-overlay ${cartOpen ? "is-open" : ""}`}
      aria-hidden={!cartOpen}
      onClick={closeCart}
    >
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="cart-drawer-grab" aria-hidden="true" />
        <div className="cart-drawer-head">
          <div>
            <span className="cart-drawer-eyebrow">
              {t("cart.itemCount", { count: itemCount })}
            </span>
            <h2 id="cart-drawer-title">{t("cart.title")}</h2>
          </div>
          <button
            className="cart-drawer-close"
            type="button"
            aria-label={t("common.close")}
            onClick={closeCart}
          >
            <Icon name="x" />
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><Icon name="cart" /></span>
              <h2>{t("cart.empty")}</h2>
              <p>{t("cart.emptyDesc")}</p>
              <Link className="btn btn-primary btn-sm" href="/order" onClick={closeCart}>
                <span>{t("cart.browse")}</span>
                <Icon name="arrow-right" />
              </Link>
            </div>
          ) : (
            <div className="cart-card cart-drawer-card">
              <div className="cart-list">
                {cart.map((line) => {
                  const item = KANTIN_DATA.menuById(line.menuId);
                  const name = line.name || item?.name;
                  const price = Number(line.price ?? item?.price ?? 0);
                  const options = (line.optionLabels?.length ? orderItemSummary({ optionLabels: line.optionLabels }, lang) : item ? KANTIN_DATA.orderItemSummary(line, lang) : "");
                  return (
                    <div className="cart-item" key={line.lineId}>
                      <div className="cart-thumb">
                        <img
                          src={line.image || item?.image || "/assets/menu/placeholder.webp"}
                          alt={localized(name, lang)}
                          width={800}
                          height={800}
                          decoding="async"
                        />
                      </div>
                      <div className="cart-item-copy">
                        <h3>{localized(name, lang)}</h3>
                        {options ? <p>{options}</p> : null}
                        {line.note ? <p className="cart-note">{t("cart.note")}: {line.note}</p> : null}
                        <div className="cart-item-bottom">
                          <div className="qty-stepper">
                            <button
                              type="button"
                              aria-label="Kurangi jumlah"
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
                          <span className="cart-item-price">
                            {KANTIN_DATA.formatIDR(price * line.qty)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="cart-remove"
                        type="button"
                        aria-label={t("cart.remove")}
                        onClick={() => {
                          removeLine(line.lineId);
                          toast(t("cart.removed"));
                        }}
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {cart.length ? (
          <div className="cart-drawer-foot">
            <div className="checkout-bar-copy">
              <small>{t("cart.total")}</small>
              <strong>{KANTIN_DATA.formatIDR(cartTotal)}</strong>
            </div>
            <Link className="btn" href="/checkout" onClick={closeCart}>
              {t("cart.checkout")}
              <Icon name="arrow-right" />
            </Link>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
