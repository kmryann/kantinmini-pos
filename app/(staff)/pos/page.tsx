"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/ToastProvider";
import { KANTIN_DATA } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";

type MenuItem = (typeof KANTIN_DATA.menu)[number];
type PosLine = { lineId: string; menuId: string; qty: number; options: string[]; note: string };
type PosOrder = {
  code: string;
  customer: string;
  type: "dine-in" | "takeaway";
  table: number | null;
  items: { menuId: string; qty: number; options: string[]; note: string }[];
  total: number;
  payment: "QRIS" | "Cash";
  paymentStatus: "pending" | "paid";
  orderStatus: "new";
  source: "POS";
  createdAt: string;
  paidAt: string | null;
  paymentCode: null;
};

const signature = (line: Omit<PosLine, "lineId"> | PosLine) =>
  JSON.stringify({
    menuId: line.menuId,
    options: [...(line.options || [])].sort(),
    note: (line.note || "").trim().toLowerCase(),
  });

export default function PosPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");
  const [table, setTable] = useState("3");
  const [customer, setCustomer] = useState("");
  const [payment, setPayment] = useState<"Cash" | "QRIS">("Cash");
  const [cashReceived, setCashReceived] = useState("");
  const [items, setItems] = useState<PosLine[]>([]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [optionItem, setOptionItem] = useState<MenuItem | null>(null);
  const [optionSelections, setOptionSelections] = useState<Record<string, string>>({});
  const [optionNote, setOptionNote] = useState("");
  const [noteLineId, setNoteLineId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [qrisOrder, setQrisOrder] = useState<PosOrder | null>(null);
  const [successCode, setSuccessCode] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    document.title = "POS · Kantin Mini";
  }, [lang]);

  useEffect(() => {
    document.body.classList.toggle("pos-order-open", orderOpen);
    return () => document.body.classList.remove("pos-order-open");
  }, [orderOpen]);

  const anyModal = Boolean(optionItem || noteLineId || qrisOrder || successOpen);
  useEffect(() => {
    document.body.classList.toggle("modal-open", anyModal);
    return () => document.body.classList.remove("modal-open");
  }, [anyModal]);

  const categories = [{ id: "all", name: { id: "Semua", en: "All" } }, ...KANTIN_DATA.categories];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return KANTIN_DATA.menu.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (!query) return true;
      return `${KANTIN_DATA.localized(item.name, lang)} ${KANTIN_DATA.localized(item.desc, lang)}`
        .toLowerCase()
        .includes(query);
    });
  }, [activeCategory, search, lang]);

  const total = useMemo(
    () =>
      items.reduce((sum, line) => {
        const item = KANTIN_DATA.menuById(line.menuId);
        return sum + (item ? item.price : 0) * line.qty;
      }, 0),
    [items],
  );
  const itemCount = items.reduce((sum, line) => sum + line.qty, 0);
  const change = Math.max(0, Number(cashReceived || 0) - total);
  const tableLabel = `${t("label.table")} ${String(table).padStart(2, "0")}`;
  const optionComplete = optionItem
    ? optionItem.options.every((group) => optionSelections[group.id])
    : false;

  const addLine = (item: MenuItem, qty: number, options: string[], note: string) => {
    setItems((current) => {
      const candidate = { menuId: item.id, qty, options, note };
      const target = signature(candidate);
      const existing = current.find((line) => signature(line) === target);
      if (existing) {
        return current.map((line) =>
          line.lineId === existing.lineId ? { ...line, qty: line.qty + qty } : line,
        );
      }
      return [
        {
          ...candidate,
          lineId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        },
        ...current,
      ];
    });
  };

  const openOptions = (item: MenuItem) => {
    setOptionItem(item);
    setOptionSelections({});
    setOptionNote("");
  };

  const resetOrder = () => {
    setItems([]);
    setCustomer("");
    setCashReceived("");
    setPayment("Cash");
    setOrderType("dine-in");
    setTable("3");
  };

  const showSuccess = (order: PosOrder) => {
    KANTIN_DATA.savePosOrder(order);
    setSuccessCode(order.code);
    setSuccessOpen(true);
    setOrderOpen(false);
    setQrisOrder(null);
    resetOrder();
  };

  const submitPayment = () => {
    if (!items.length) return;
    if (payment === "Cash" && Number(cashReceived || 0) < total) {
      toast(t("pos.cashShort"), "error");
      return;
    }
    const now = new Date().toISOString();
    const order: PosOrder = {
      code: `P-${Math.floor(100 + Math.random() * 900)}`,
      customer: customer.trim() || t("pos.walkIn"),
      type: orderType,
      table: orderType === "dine-in" ? Number(table) : null,
      items: items.map((line) => ({
        menuId: line.menuId,
        qty: line.qty,
        options: line.options,
        note: line.note,
      })),
      total,
      payment,
      paymentStatus: payment === "Cash" ? "paid" : "pending",
      orderStatus: "new",
      source: "POS",
      createdAt: now,
      paidAt: payment === "Cash" ? now : null,
      paymentCode: null,
    };
    if (payment === "QRIS") {
      setQrisOrder(order);
      return;
    }
    showSuccess(order);
  };

  const simulateQris = () => {
    if (!qrisOrder) return;
    showSuccess({ ...qrisOrder, paymentStatus: "paid", paidAt: new Date().toISOString() });
  };

  return (
    <>
      <div className="pos-layout">
        <section className="pos-menu-panel" aria-label="Menu">
          <div className="pos-toolbar">
            <div className="pos-search">
              <Icon name="search" />
              <input
                className="input"
                type="search"
                autoComplete="off"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("pos.searchPlaceholder")}
              />
            </div>
          </div>
          <div className="pos-categories">
            {categories.map((category) => (
              <button
                className={`pos-cat ${activeCategory === category.id ? "is-active" : ""}`}
                type="button"
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                {KANTIN_DATA.localized(category.name, lang)}
              </button>
            ))}
          </div>
          <div className="menu-grid">
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <span className="empty-icon"><Icon name="search" /></span>
                <h3>{t("menus.empty")}</h3>
              </div>
            ) : (
              filtered.map((item) => {
                const category = KANTIN_DATA.categoryById(item.category);
                const meta = item.available
                  ? item.options.length
                    ? t("pos.customizable")
                    : category
                      ? KANTIN_DATA.localized(category.name, lang)
                      : ""
                  : t("label.soldOut");
                return (
                  <article className={`pos-menu-card ${item.available ? "" : "is-soldout"}`} key={item.id}>
                    <div className="pos-menu-image">
                      <img src={item.image} alt={KANTIN_DATA.localized(item.name, lang)} width={800} height={800} decoding="async" />
                    </div>
                    <div className="pos-menu-copy">
                      <h3>{KANTIN_DATA.localized(item.name, lang)}</h3>
                      <p>{KANTIN_DATA.formatIDR(item.price)}</p>
                      <small>{meta}</small>
                    </div>
                    <button
                      className="pos-add"
                      type="button"
                      disabled={!item.available}
                      aria-label={`${t("action.add")} ${KANTIN_DATA.localized(item.name, lang)}`}
                      onClick={() => {
                        if (!item.available) return;
                        if (item.options.length) openOptions(item);
                        else addLine(item, 1, [], "");
                      }}
                    >
                      <Icon name="plus" />
                      <span>{t("action.add")}</span>
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <aside className={`pos-order-panel ${orderOpen ? "is-open" : ""}`} aria-label={t("pos.currentOrder")}>
          <div className="pos-order-head">
            <div>
              <h2>{t("pos.currentOrder")}</h2>
              <p>{orderType === "takeaway" ? t("label.takeaway") : `${t("label.dineIn")} · ${tableLabel}`}</p>
            </div>
            <div className="page-actions">
              <button
                className="icon-btn"
                type="button"
                aria-label={t("pos.clear")}
                title={t("pos.clear")}
                disabled={!items.length}
                onClick={() => {
                  if (window.confirm(t("pos.clearConfirm"))) resetOrder();
                }}
              >
                <Icon name="trash" />
              </button>
              <button className="icon-btn pos-close" id="pos-close" type="button" aria-label={t("action.close")} onClick={() => setOrderOpen(false)}>
                <Icon name="x" />
              </button>
            </div>
          </div>

          <div className="pos-order-body">
            <div className="pos-type" role="group" aria-label={t("pos.orderType")}>
              {(["dine-in", "takeaway"] as const).map((value) => (
                <button
                  type="button"
                  className={orderType === value ? "is-active" : ""}
                  key={value}
                  onClick={() => setOrderType(value)}
                >
                  {value === "dine-in" ? t("label.dineIn") : t("label.takeaway")}
                </button>
              ))}
            </div>

            <div className="pos-customer">
              {orderType === "dine-in" ? (
                <div className="field">
                  <label htmlFor="pos-table">{t("label.table")}</label>
                  <select className="select" id="pos-table" value={table} onChange={(event) => setTable(event.target.value)}>
                    {[1, 2, 3, 4, 5, 6, 7].map((number) => (
                      <option value={number} key={number}>
                        {t("label.table")} {String(number).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="pos-customer">{t("pos.customerName")}</label>
                <input
                  className="input"
                  id="pos-customer"
                  value={customer}
                  onChange={(event) => setCustomer(event.target.value)}
                  placeholder={t("pos.customerPlaceholder")}
                  maxLength={60}
                />
              </div>
            </div>

            {items.length === 0 ? (
              <div className="pos-empty">
                <Icon name="cart" />
                <p>{t("pos.emptyOrder")}</p>
              </div>
            ) : (
              <ul className="pos-order-items">
                {items.map((line) => {
                  const item = KANTIN_DATA.menuById(line.menuId);
                  if (!item) return null;
                  const options = KANTIN_DATA.orderItemSummary(line, lang);
                  return (
                    <li className="pos-order-item" key={line.lineId}>
                      <div>
                        <p className="pos-order-item-name">{KANTIN_DATA.localized(item.name, lang)}</p>
                        {options ? <p className="pos-order-item-meta">{options}</p> : null}
                        {line.note ? <p className="pos-order-item-meta">{t("label.notes")}: {line.note}</p> : null}
                        <p className="pos-order-item-price">{KANTIN_DATA.formatIDR(item.price * line.qty)}</p>
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          style={{ minHeight: 24, padding: "2px 0", fontSize: "0.66rem" }}
                          onClick={() => {
                            setNoteLineId(line.lineId);
                            setNoteValue(line.note);
                          }}
                        >
                          {t("label.notes")}
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                        <div className="qty-stepper">
                          <button type="button" aria-label="Kurangi jumlah" onClick={() => setItems((current) => current.map((entry) => entry.lineId === line.lineId ? { ...entry, qty: Math.max(1, entry.qty - 1) } : entry))}>
                            <Icon name="minus" />
                          </button>
                          <span>{line.qty}</span>
                          <button type="button" aria-label="Tambah jumlah" onClick={() => setItems((current) => current.map((entry) => entry.lineId === line.lineId ? { ...entry, qty: entry.qty + 1 } : entry))}>
                            <Icon name="plus" />
                          </button>
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          style={{ minHeight: 24, padding: "2px 0", fontSize: "0.66rem", color: "#a63c2a" }}
                          onClick={() => setItems((current) => current.filter((entry) => entry.lineId !== line.lineId))}
                        >
                          {t("action.remove")}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="pos-totals">
              <div className="pos-total-row">
                <span>{t("label.total")}</span>
                <strong>{KANTIN_DATA.formatIDR(total)}</strong>
              </div>
            </div>

            <div className="pos-payment">
              <span className="field-label">{t("label.paymentMethod")}</span>
              <div className="pos-payment-options" role="group" aria-label={t("label.paymentMethod")}>
                {(["Cash", "QRIS"] as const).map((value) => (
                  <button
                    type="button"
                    className={`payment-option ${payment === value ? "is-active" : ""}`}
                    key={value}
                    onClick={() => setPayment(value)}
                  >
                    <Icon name={value === "Cash" ? "banknote" : "qr"} />
                    <span>{value === "Cash" ? t("label.cash") : t("label.qris")}</span>
                  </button>
                ))}
              </div>
              {payment === "Cash" ? (
                <div className="pos-cash-field is-visible">
                  <div className="field">
                    <label htmlFor="pos-cash-received">{t("pos.cashReceived")}</label>
                    <input
                      className="input"
                      id="pos-cash-received"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={cashReceived}
                      onChange={(event) => setCashReceived(event.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="pos-total-row">
                    <span>{t("pos.change")}</span>
                    <strong style={{ fontSize: "0.9rem" }}>{KANTIN_DATA.formatIDR(change)}</strong>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="pos-order-foot">
            <button className="btn btn-primary btn-block" type="button" disabled={!items.length} onClick={submitPayment}>
              {t("pos.pay")}
            </button>
          </div>
        </aside>
      </div>

      <button
        className="pos-mobile-trigger"
        type="button"
        onClick={() => {
          setOrderOpen(true);
          document.body.classList.remove("sidebar-open");
        }}
      >
        <span><Icon name="cart" /><strong>{KANTIN_DATA.formatIDR(total)}</strong></span>
        <span>{t("pos.mobileCart")}</span>
      </button>
      <div className="pos-mobile-backdrop" onClick={() => setOrderOpen(false)} />

      {optionItem ? (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="pos-options-title">
          <div className="modal-card">
            <div className="modal-head">
              <div>
                <h2 id="pos-options-title">{t("pos.chooseOptions")}</h2>
                <p>{KANTIN_DATA.localized(optionItem.name, lang)} · {KANTIN_DATA.formatIDR(optionItem.price)}</p>
              </div>
              <button className="icon-btn" type="button" aria-label={t("action.close")} onClick={() => setOptionItem(null)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              <div className="option-groups">
                {optionItem.options.map((group) => (
                  <div className="option-group" key={group.id}>
                    <h3>
                      {KANTIN_DATA.localized(group.label, lang)}
                      <span className="option-required" style={{ padding: "2px 6px", borderRadius: 999, background: "rgba(226,97,70,.09)", color: "#a63c2a", fontSize: ".57rem", fontWeight: 700 }}>{t("label.required")}</span>
                    </h3>
                    <div className="option-choice-list">
                      {group.choices.map((choice) => (
                        <label className={`option-choice ${optionSelections[group.id] === choice.id ? "is-selected" : ""}`} key={choice.id}>
                          <span>{KANTIN_DATA.localized(choice.label, lang)}</span>
                          <input
                            type="radio"
                            name={`pos-group-${group.id}`}
                            checked={optionSelections[group.id] === choice.id}
                            onChange={() => setOptionSelections((current) => ({ ...current, [group.id]: choice.id }))}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="field" style={{ marginTop: 18 }}>
                <label htmlFor="pos-option-note">{t("label.notes")}</label>
                <textarea
                  className="textarea"
                  id="pos-option-note"
                  value={optionNote}
                  onChange={(event) => setOptionNote(event.target.value)}
                  placeholder={t("pos.notePlaceholder")}
                />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" type="button" onClick={() => setOptionItem(null)}>{t("action.cancel")}</button>
              <button
                className="btn btn-primary"
                type="button"
                disabled={!optionComplete}
                onClick={() => {
                  if (!optionComplete) return;
                  addLine(optionItem, 1, Object.values(optionSelections), optionNote.trim());
                  setOptionItem(null);
                }}
              >
                {t("pos.addToOrder")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {noteLineId ? (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="pos-note-title">
          <div className="modal-card">
            <div className="modal-head">
              <div>
                <h2 id="pos-note-title">{t("pos.noteTitle")}</h2>
                <p>{KANTIN_DATA.localized(KANTIN_DATA.menuById(items.find((line) => line.lineId === noteLineId)?.menuId || "")?.name || { id: "", en: "" }, lang)}</p>
              </div>
              <button className="icon-btn" type="button" aria-label={t("action.close")} onClick={() => setNoteLineId(null)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              <textarea className="textarea" value={noteValue} onChange={(event) => setNoteValue(event.target.value)} placeholder={t("pos.notePlaceholder")} />
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" type="button" onClick={() => setNoteLineId(null)}>{t("action.cancel")}</button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setItems((current) => current.map((line) => line.lineId === noteLineId ? { ...line, note: noteValue.trim() } : line));
                  setNoteLineId(null);
                  toast(t("pos.noteSaved"));
                }}
              >
                {t("action.save")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {qrisOrder ? (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="pos-qris-title">
          <div className="modal-card">
            <div className="modal-head">
              <div>
                <h2 id="pos-qris-title">{t("pos.qrisModalTitle")}</h2>
                <p>{t("pos.qrisModalDesc")}</p>
              </div>
              <button className="icon-btn" type="button" aria-label={t("action.close")} onClick={() => setQrisOrder(null)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              <div className="pos-qris-box">
                <img src="/assets/qr/qris-demo.svg" width={320} height={320} alt="QRIS demo" />
                <strong>{KANTIN_DATA.formatIDR(qrisOrder.total)}</strong>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" type="button" onClick={() => setQrisOrder(null)}>{t("action.cancel")}</button>
              <button className="btn btn-primary" type="button" onClick={simulateQris}>{t("pos.simulatePaid")}</button>
            </div>
          </div>
        </div>
      ) : null}

      {successOpen ? (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="pos-success-title">
          <div className="modal-card">
            <div className="modal-body">
              <div className="pos-success">
                <span className="empty-icon"><Icon name="check-circle" /></span>
                <h2 id="pos-success-title">{t("pos.newOrderTitle")}</h2>
                <p>{t("pos.newOrderDesc")}</p>
                <div className="pos-success-code">
                  <span>{t("pos.orderCode")}</span>
                  <strong>{successCode}</strong>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" type="button" onClick={() => setSuccessOpen(false)}>{t("pos.newOrder")}</button>
              <Link className="btn btn-primary" href="/orders">{t("pos.viewOrders")}</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
