"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { useCustomer } from "@/components/CustomerProvider";
import { useToast } from "@/components/ToastProvider";
import { formatIDR } from "@/lib/format";
import type { MenuItem } from "@/lib/api-types";
import { localized, optionLabelsFor } from "@/lib/order-utils";
import { useMenuData } from "@/lib/use-menu";
import { useLanguage } from "@/lib/i18n";

export default function OrderPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const { cart, cartCount, cartTotal, addToCart, updateLine, removeLine, openCart } = useCustomer();
  const { menu, categories: menuCategories, loading: menuLoading, error: menuError, reload: reloadMenu } = useMenuData();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [customItem, setCustomItem] = useState<MenuItem | null>(null);
  const [customQty, setCustomQty] = useState(1);
  const [customNote, setCustomNote] = useState("");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [detailClosing, setDetailClosing] = useState(false);
  const [customClosing, setCustomClosing] = useState(false);

  const modalOpen = Boolean(detailItem || customItem);

  useEffect(() => {
    document.body.classList.toggle("modal-open", modalOpen);
    return () => document.body.classList.remove("modal-open");
  }, [modalOpen]);

  useEffect(() => {
    document.title = `Menu · Kantin Mini`;
  }, [lang]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cart") !== "open") return;
    openCart();
    params.delete("cart");
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [openCart]);

  const menuName = (item: MenuItem) => localized(item.name, lang);
  const menuDesc = (item: MenuItem) => localized(item.desc, lang);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return menu.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (!query) return true;
      return `${menuName(item)} ${menuDesc(item)}`.toLowerCase().includes(query);
    });
  }, [activeCategory, search, lang, menu]);

  const qtyFor = (menuId: string) =>
    cart.filter((line) => line.menuId === menuId).reduce((sum, line) => sum + line.qty, 0);

  const openDetail = (item: MenuItem) => {
    setDetailClosing(false);
    setDetailItem(item);
  };

  const openCustomize = (item: MenuItem, qty: number, note: string) => {
    setCustomClosing(false);
    setCustomItem(item);
    setCustomQty(qty);
    setCustomNote(note);
    setSelections({});
  };

  const closeDetail = () => {
    if (detailClosing) return;
    setDetailClosing(true);
    window.setTimeout(() => {
      setDetailItem(null);
      setDetailClosing(false);
    }, 300);
  };

  const closeCustom = () => {
    if (customClosing) return;
    setCustomClosing(true);
    window.setTimeout(() => {
      setCustomItem(null);
      setCustomClosing(false);
    }, 300);
  };

  const addItem = (item: MenuItem, qty: number, options: string[], note: string) => {
    addToCart({
      menuId: item.id,
      qty,
      options,
      note,
      name: item.name,
      image: item.image,
      price: item.price,
      optionLabels: optionLabelsFor(item, options),
    });
    toast(t("order.added"));
  };

  const incrementMenu = (item: MenuItem) => {
    const lines = cart.filter((line) => line.menuId === item.id);
    if (!lines.length) {
      if (item.options.length) openCustomize(item, 1, "");
      else addItem(item, 1, [], "");
      return;
    }
    const line = lines[0];
    updateLine(line.lineId, { qty: line.qty + 1 });
  };

  const decrementMenu = (item: MenuItem) => {
    const lines = cart.filter((line) => line.menuId === item.id);
    if (!lines.length) return;
    const line = lines[lines.length - 1];
    if (line.qty > 1) updateLine(line.lineId, { qty: line.qty - 1 });
    else removeLine(line.lineId);
  };

  const addFromList = (item: MenuItem) => {
    if (!item.available) return;
    if (item.options.length) openCustomize(item, 1, "");
    else addItem(item, 1, [], "");
  };

  const submitDetail = () => {
    if (!detailItem || !detailItem.available) return;
    if (detailItem.options.length) {
      const item = detailItem;
      setDetailItem(null);
      setDetailClosing(false);
      openCustomize(item, 1, "");
    } else {
      addItem(detailItem, 1, [], "");
    }
  };

  const incrementDetail = (item: MenuItem) => {
    if (item.options.length) {
      setDetailItem(null);
      setDetailClosing(false);
      openCustomize(item, 1, "");
      return;
    }
    incrementMenu(item);
  };

  const confirmCustomize = () => {
    if (!customItem) return;
    const complete = customItem.options.every((group) => selections[group.id]);
    if (!complete) return;
    addItem(customItem, customQty, Object.values(selections), customNote);
    closeCustom();
  };

  const categories = [{ id: "all", name: { id: "Semua", en: "All" } }, ...menuCategories];

  return (
    <>
      <main className="cust-main order-main">
        <div className="order-container">
          <div className="order-intro">
            <h2>{t("order.title")}</h2>
            <p>{t("order.subtitle")}</p>
          </div>
        </div>

        <div className="order-sticky">
          <div className="order-sticky-inner">
            <div className="search-field">
              <Icon name="search" />
              <input
                className="input"
                type="search"
                autoComplete="off"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("order.searchPlaceholder")}
              />
            </div>
            <div className="category-tabs" role="tablist" aria-label="Kategori menu">
              {categories.map((category) => (
                <button
                  className={`cat-tab ${activeCategory === category.id ? "is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category.id}
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {localized(category.name, lang)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="menu-list">
          {menuLoading ? (
            <div className="empty-state">
              <span className="empty-icon"><Icon name="refresh" /></span>
              <h2>{lang === "id" ? "Memuat menu…" : "Loading menu…"}</h2>
            </div>
          ) : menuError ? (
            <div className="empty-state">
              <span className="empty-icon"><Icon name="alert" /></span>
              <h2>{lang === "id" ? "Menu gagal dimuat" : "Could not load menu"}</h2>
              <p>{menuError}</p>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => void reloadMenu()}>
                {lang === "id" ? "Coba lagi" : "Try again"}
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><Icon name="search" /></span>
              <h2>{t("order.empty")}</h2>
              <p>{t("order.emptyDesc")}</p>
            </div>
          ) : (
            filtered.map((item) => {
              const name = menuName(item);
              return (
                <article
                  className={`menu-item ${item.available ? "" : "is-soldout"}`}
                  key={item.id}
                >
                  <button className="menu-info" type="button" onClick={() => openDetail(item)}>
                    {item.popular ? (
                      <span className="menu-tag">
                        <Icon name="flame" />
                        {t("order.favorite")}
                      </span>
                    ) : null}
                    <span className="menu-title">{name}</span>
                    <span className="menu-desc">{menuDesc(item)}</span>
                    <span className="menu-price">
                      <strong>{formatIDR(item.price)}</strong>
                    </span>
                  </button>
                  <div className="menu-media">
                    <button
                      className="menu-image-button"
                      type="button"
                      aria-label={name}
                      onClick={() => openDetail(item)}
                    >
                      <img src={item.image} alt={name} width={800} height={800} decoding="async" />
                    </button>
                    {!item.available ? <span className="soldout-label">{t("order.soldOut")}</span> : null}
                    {qtyFor(item.id) > 0 ? (
                      <div className="menu-qty">
                        <button type="button" aria-label={t("common.qty")} onClick={() => decrementMenu(item)}>
                          <Icon name="minus" />
                        </button>
                        <span>{qtyFor(item.id)}</span>
                        <button type="button" aria-label={t("order.add")} onClick={() => incrementMenu(item)}>
                          <Icon name="plus" />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="menu-add"
                        type="button"
                        disabled={!item.available}
                        aria-label={`${t("order.add")} ${name}`}
                        onClick={() => addFromList(item)}
                      >
                        <Icon name="plus" />
                        <span>{t("order.add")}</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>

      {cartCount > 0 ? (
        <div className="cart-bar is-visible" aria-live="polite">
          <div className="bar-inner">
            <div className="cart-bar-copy">
              <span className="cart-bar-count">{cartCount}</span>
              <span className="cart-bar-text">
                <small>{t("common.items", { count: cartCount })}</small>
                <strong>{formatIDR(cartTotal)}</strong>
              </span>
            </div>
            <Link className="btn" href="/checkout">
              <span>{t("order.viewCart")}</span>
              <Icon name="arrow-right" />
            </Link>
          </div>
        </div>
      ) : null}

      {detailItem ? (
        <div
          className={`cust-modal is-open ${detailClosing ? "is-closing" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-name"
          onClick={(event) => { if (event.target === event.currentTarget) closeDetail(); }}
        >
          <div className="sheet detail-sheet">
            <div className="sheet-media">
              <img src={detailItem.image} alt={menuName(detailItem)} />
              <button
                className="sheet-close"
                type="button"
                aria-label={t("common.close")}
                onClick={closeDetail}
              >
                <Icon name="x" />
              </button>
            </div>
            <div className="sheet-body detail-body">
              <h2 id="detail-name">{menuName(detailItem)}</h2>
              <span className="sheet-price">{formatIDR(detailItem.price)}</span>
              <p className="sheet-desc">{menuDesc(detailItem)}</p>
            </div>
            <div className="sheet-footer">
              {!detailItem.available ? (
                <button className="btn btn-primary" type="button" disabled>
                  {t("order.soldOut")}
                </button>
              ) : qtyFor(detailItem.id) > 0 ? (
                <div className="sheet-qty" aria-live="polite">
                  <button type="button" aria-label="Kurangi jumlah" onClick={() => decrementMenu(detailItem)}>
                    <Icon name="minus" />
                  </button>
                  <span>{qtyFor(detailItem.id)}</span>
                  <button type="button" aria-label="Tambah jumlah" onClick={() => incrementDetail(detailItem)}>
                    <Icon name="plus" />
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" type="button" onClick={submitDetail}>
                  {t("order.addToCart")}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {customItem ? (
        <div
          className={`cust-modal is-open ${customClosing ? "is-closing" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-title"
          onClick={(event) => { if (event.target === event.currentTarget) closeCustom(); }}
        >
          <div className="sheet">
            <div className="sheet-head">
              <div>
                <h2 id="custom-title">{t("order.chooseOptions")}</h2>
                <p>{menuName(customItem)} · {formatIDR(customItem.price)}</p>
              </div>
              <button
                className="sheet-close"
                type="button"
                aria-label={t("common.close")}
                onClick={closeCustom}
              >
                <Icon name="x" />
              </button>
            </div>
            <div className="sheet-body">
              <div className="option-groups">
                {customItem.options.map((group) => (
                  <div className="option-group" key={group.id}>
                    <h3>
                      {localized(group.label, lang)}
                      <span className="option-required">{t("order.required")}</span>
                    </h3>
                    <div className="option-choice-list">
                      {group.choices.map((choice) => (
                        <label
                          className={`option-choice ${selections[group.id] === choice.id ? "is-selected" : ""}`}
                          key={choice.id}
                        >
                          <span>{localized(choice.label, lang)}</span>
                          <input
                            type="radio"
                            name={`group-${group.id}`}
                            checked={selections[group.id] === choice.id}
                            onChange={() => setSelections((current) => ({ ...current, [group.id]: choice.id }))}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="cust-note">
                <Icon name="check" />
                <span>{t("order.requiredHint")}</span>
              </div>
            </div>
            <div className="sheet-footer">
              <button
                className="btn btn-primary"
                type="button"
                disabled={!customItem.options.every((group) => selections[group.id])}
                onClick={confirmCustomize}
              >
                {t("order.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
