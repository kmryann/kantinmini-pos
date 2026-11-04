"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useCustomer } from "@/components/CustomerProvider";
import { useLanguage } from "@/lib/i18n";

const pageTitles: Record<string, { id: string; en: string }> = {
  "/order": { id: "Menu", en: "Menu" },
  "/cart": { id: "Keranjang", en: "Cart" },
  "/checkout": { id: "Checkout", en: "Checkout" },
  "/status": { id: "Status Pesanan", en: "Order Status" },
};

export function CustomerHeader() {
  const pathname = usePathname();
  const { lang, t } = useLanguage();
  const { context, cartCount, openCart } = useCustomer();
  const title = pageTitles[pathname]?.[lang] ?? "Kantin Mini";
  const contextLabel =
    context.type === "takeaway"
      ? t("common.takeawayValue")
      : `${t("common.table")} ${String(context.table ?? 1).padStart(2, "0")}`;
  const contextType =
    context.type === "takeaway" ? t("common.takeaway") : t("common.dineIn");

  return (
    <header className="cust-header">
      <div className="cust-header-inner">
        <Link className="brand" href="/" aria-label="Kantin Mini">
          <span className="brand-mark">
            <Icon name="logo-mark" className="logo" />
          </span>
          <span className="brand-word">
            Kantin <em>Mini</em>
          </span>
        </Link>
        <h1 className="cust-header-title">{title}</h1>
        <div className="cust-header-actions">
          <span className={`context-pill is-${context.type}`}>
            <Icon name={context.type === "takeaway" ? "bag" : "pin"} />
            <span className="context-pill-label">{contextType}</span>
            <span className="context-pill-divider" aria-hidden="true" />
            <strong>{contextLabel}</strong>
          </span>
          <button className="cart-link" type="button" aria-label={t("common.cart")} onClick={openCart}>
            <Icon name="cart" />
            <span className="cart-count" data-empty={cartCount === 0}>
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
