"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/ToastProvider";
import { KANTIN_DATA } from "@/lib/data";
import { formatTime } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { readActiveOrder, saveActiveOrder } from "@/lib/customer-storage";

type Order = {
  code: string;
  customer: string;
  type: "dine-in" | "takeaway";
  table: number | null;
  items: { menuId: string; qty: number; options: string[]; note: string }[];
  total: number;
  payment: "QRIS" | "Cash";
  paymentStatus: "pending" | "paid" | "expired" | "cancelled";
  orderStatus: "new" | "cooking" | "ready" | "cancelled";
  source: "QR" | "POS";
  createdAt: string;
  paidAt?: string | null;
  paymentCode?: string | null;
  _source: "seed" | "pos" | "active";
};

export default function OrdersPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const initialOrders = useMemo(
    () =>
      KANTIN_DATA.orders.map((order: any) => ({ ...order, _source: "seed" as const })) as Order[],
    [],
  );
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [receiptWidth, setReceiptWidth] = useState("80");

  useEffect(() => {
    document.title = "Pesanan & pembayaran · Kantin Mini";
  }, [lang]);

  const load = useCallback(() => {
    const map = new Map<string, Order>();
    KANTIN_DATA.orders.forEach((order) => map.set(order.code, { ...order, _source: "seed" }));
    KANTIN_DATA.getPosOrders().forEach((order) => map.set(order.code, { ...order, _source: "pos" }));
    const active = readActiveOrder();
    if (active) map.set(active.code, { ...active, _source: "active" });
    const next = [...map.values()].sort((a, b) => {
      const rank = (order: Order) => {
        if (order.paymentStatus === "pending") return 0;
        if (order.paymentStatus === "paid" && order.orderStatus !== "ready") return 1;
        if (order.paymentStatus === "paid") return 2;
        return 3;
      };
      const difference = rank(a) - rank(b);
      if (difference !== 0) return difference;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setOrders(next);
  }, []);

  useEffect(() => {
    load();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "kantin-active-order" || event.key === "kantin-pos-orders") load();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [load]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(receiptOrder));
    return () => document.body.classList.remove("modal-open");
  }, [receiptOrder]);

  const typeLabel = (order: Order) =>
    order.type === "takeaway"
      ? t("label.takeaway")
      : `${t("label.table")} ${String(order.table || 1).padStart(2, "0")}`;

  const sourceLabel = (order: Order) => (order.source === "POS" ? t("orders.sourcePos") : t("orders.sourceQr"));

  const paymentBadge = (order: Order) => {
    const map = {
      paid: ["paid", t("label.paid")],
      pending: ["pending", t("label.pending")],
      expired: ["expired", t("label.expired")],
      cancelled: ["cancelled", t("label.cancelled")],
    } as const;
    const [tone, label] = map[order.paymentStatus] || map.pending;
    return <span className={`badge badge-${tone}`}>{label}</span>;
  };

  const matchedOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) =>
      `${order.code} ${order.customer}`.toLowerCase().includes(query),
    );
  }, [orders, search]);

  const pendingOrders = matchedOrders.filter((order) => order.paymentStatus === "pending");
  const processingOrders = matchedOrders.filter(
    (order) =>
      order.paymentStatus === "paid" &&
      (order.orderStatus === "new" || order.orderStatus === "cooking"),
  );
  const readyOrders = matchedOrders.filter(
    (order) => order.paymentStatus === "paid" && order.orderStatus === "ready",
  );
  const archiveOrders = matchedOrders.filter(
    (order) => order.paymentStatus === "expired" || order.paymentStatus === "cancelled",
  );

  const persist = (order: Order, patch: Partial<Order>) => {
    setOrders((current) =>
      current.map((entry) => (entry.code === order.code ? { ...entry, ...patch } : entry)),
    );
    if (order._source === "pos") {
      const list = KANTIN_DATA.getPosOrders().map((entry) =>
        entry.code === order.code ? { ...entry, ...patch } : entry,
      );
      localStorage.setItem("kantin-pos-orders", JSON.stringify(list));
    }
    if (order._source === "active") {
      const active = readActiveOrder();
      if (active && active.code === order.code) saveActiveOrder({ ...active, ...patch });
    }
  };

  const updateStatus = (order: Order, action: string) => {
    if (action === "accept") {
      persist(order, { paymentStatus: "paid", paidAt: new Date().toISOString() });
      toast(t("orders.accepted"));
    } else if (action === "cooking") {
      persist(order, { orderStatus: "cooking" });
      toast(t("orders.statusUpdated"));
    } else if (action === "ready") {
      persist(order, { orderStatus: "ready" });
      toast(t("orders.statusUpdated"));
    } else if (action === "cancel") {
      if (order.paymentStatus !== "pending") {
        toast(t("orders.onlyUnpaid"), "error");
        return;
      }
      if (!window.confirm(t("orders.cancelConfirm"))) return;
      persist(order, { paymentStatus: "cancelled", orderStatus: "cancelled" });
      toast(t("orders.cancelled"));
    } else if (action === "receipt") {
      try {
        setReceiptWidth(localStorage.getItem("kantin-receipt-width") === "58" ? "58" : "80");
      } catch {
        setReceiptWidth("80");
      }
      setReceiptOrder(order);
    }
  };

  const actionButtons = (order: Order) => {
    if (order.paymentStatus === "pending" && order.payment === "Cash") {
      return (
        <>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => updateStatus(order, "accept")}>
            <Icon name="check" />{t("orders.acceptCash")}
          </button>
          <button className="btn btn-danger btn-sm" type="button" onClick={() => updateStatus(order, "cancel")}>
            <Icon name="x" />{t("orders.cancel")}
          </button>
        </>
      );
    }
    if (order.paymentStatus === "pending") {
      return (
        <button className="btn btn-danger btn-sm" type="button" title={t("orders.onlyUnpaid")} onClick={() => updateStatus(order, "cancel")}>
          <Icon name="x" />{t("orders.cancel")}
        </button>
      );
    }
    if (order.paymentStatus === "paid") {
      return (
        <>
          {order.orderStatus === "new" ? (
            <button className="btn btn-primary btn-sm" type="button" onClick={() => updateStatus(order, "cooking")}>
              <Icon name="chef-hat" />{t("orders.markCooking")}
            </button>
          ) : order.orderStatus === "cooking" ? (
            <button className="btn btn-primary btn-sm" type="button" onClick={() => updateStatus(order, "ready")}>
              <Icon name="check" />{t("orders.markReady")}
            </button>
          ) : null}
          <button className="btn btn-outline btn-sm" type="button" onClick={() => updateStatus(order, "receipt")}>
            <Icon name="printer" />{t("action.reprint")}
          </button>
        </>
      );
    }
    return null;
  };

  const renderOrderCard = (order: Order) => {
    const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
    const pendingCash = order.paymentStatus === "pending" && order.payment === "Cash";
    const pendingQr = order.paymentStatus === "pending" && order.payment === "QRIS";
    const itemSummary = order.items
      .map((item) => {
        const menu = KANTIN_DATA.menuById(item.menuId);
        return menu ? `${KANTIN_DATA.localized(menu.name, lang)} ×${item.qty}` : null;
      })
      .filter(Boolean)
      .join(" · ");

    return (
      <article
        className={`cashier-order ${pendingCash ? "is-cash" : pendingQr ? "is-qr" : `is-${order.orderStatus}`}`}
        key={order.code}
      >
        <div className="cashier-order-head">
          <span className="cashier-order-code">{order.code}</span>
          <span className="cashier-order-time">
            <Icon name="clock" />
            {formatTime(order.createdAt, lang)}
          </span>
        </div>

        <div className="cashier-order-main">
          <h3>{order.customer}</h3>
          <span className="cashier-service">
            <Icon name={order.type === "takeaway" ? "bag" : "pin"} />
            {typeLabel(order)}
          </span>
        </div>

        <p className="cashier-order-summary" title={itemSummary}>{itemSummary}</p>

        <div className="cashier-order-meta">
          <span>{t("orders.itemsCount", { count: itemCount })}</span>
          <strong>{KANTIN_DATA.formatIDR(order.total)}</strong>
        </div>

        {pendingCash ? (
          <div className="cashier-paycode">
            <span>{t("orders.paymentCode")}</span>
            <strong>{order.paymentCode || "—"}</strong>
          </div>
        ) : pendingQr ? (
          <p className="cashier-waiting">
            <Icon name="qr" />
            {t("orders.qrPending")}
          </p>
        ) : (
          <p className="cashier-paid">
            <Icon name="check-circle" />
            {t("label.paid")}
          </p>
        )}

        <div className="cashier-order-actions">{actionButtons(order)}</div>
      </article>
    );
  };

  const lanes = [
    {
      key: "pending",
      icon: "wallet" as const,
      title: t("orders.lanePending"),
      description: t("orders.lanePendingDesc"),
      orders: pendingOrders,
    },
    {
      key: "processing",
      icon: "chef-hat" as const,
      title: t("orders.laneProcessing"),
      description: t("orders.laneProcessingDesc"),
      orders: processingOrders,
    },
    {
      key: "ready",
      icon: "check-circle" as const,
      title: t("orders.laneReady"),
      description: t("orders.laneReadyDesc"),
      orders: readyOrders,
    },
  ];

  const receiptItemRows = (order: Order, withPrice: boolean) =>
    order.items.map((item, index) => {
      const menu = KANTIN_DATA.menuById(item.menuId);
      if (!menu) return null;
      const options = KANTIN_DATA.orderItemSummary(item, lang);
      return (
        <div className="receipt-line" key={`${item.menuId}-${index}`}>
          <span>
            {KANTIN_DATA.localized(menu.name, lang)} × {item.qty}
            {options ? <><br /><small>{options}</small></> : null}
            {item.note ? <><br /><small>{item.note}</small></> : null}
          </span>
          {withPrice ? <span>{KANTIN_DATA.formatIDR(menu.price * item.qty)}</span> : null}
        </div>
      );
    });

  const receiptStatus = (order: Order) =>
    order.paymentStatus === "paid"
      ? t("label.paid")
      : order.paymentStatus === "expired"
        ? t("label.expired")
        : order.paymentStatus === "cancelled"
          ? t("label.cancelled")
          : t("label.pending");

  return (
    <>
      <div className="page-head cashier-page-head">
        <div>
          <h2>{t("orders.queueTitle")}</h2>
          <p className="page-subtitle">{t("orders.subtitle")}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-sm btn-outline cashier-refresh" type="button" onClick={load}>
            <Icon name="refresh" />
            <span className="cashier-refresh-label">{t("orders.refresh")}</span>
          </button>
        </div>
      </div>

      <div className="cashier-toolbar">
        <div className="order-search">
          <Icon name="search" />
          <input
            className="input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("orders.searchPlaceholder")}
          />
        </div>
      </div>

      <div className="cashier-board">
        {lanes.map((lane) => (
          <section className={`cashier-lane is-${lane.key}`} key={lane.key}>
            <header className="cashier-lane-head">
              <div className="cashier-lane-heading">
                <span className="cashier-lane-icon"><Icon name={lane.icon} /></span>
                <div>
                  <h3>{lane.title}</h3>
                  <p>{lane.description}</p>
                </div>
              </div>
              <span className="cashier-lane-count">{lane.orders.length}</span>
            </header>
            <div className="cashier-lane-list">
              {lane.orders.length ? (
                lane.orders.map(renderOrderCard)
              ) : (
                <p className="cashier-lane-empty">
                  <Icon name="check-circle" />
                  <span>{t("orders.laneEmpty")}</span>
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      {archiveOrders.length ? (
        <details className="cashier-archive">
          <summary>
            <span className="cashier-archive-heading">
              <Icon name="receipt" />
              <span>
                <strong>{t("orders.archiveTitle")}</strong>
                <small>{t("orders.archiveDesc")}</small>
              </span>
            </span>
            <span className="cashier-lane-count">{archiveOrders.length}</span>
          </summary>
          <div className="cashier-archive-list">
            {archiveOrders.map((order) => (
              <div className="cashier-archive-row" key={order.code}>
                <span className="cashier-archive-code">{order.code}</span>
                <span className="cashier-archive-customer">{order.customer}</span>
                <span className="cashier-archive-type">{typeLabel(order)}</span>
                <strong>{KANTIN_DATA.formatIDR(order.total)}</strong>
                {paymentBadge(order)}
              </div>
            ))}
          </div>
        </details>
      ) : null}

      {receiptOrder ? (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
          <div className="modal-card modal-card-wide">
            <div className="modal-head">
              <div>
                <h2 id="receipt-title">{t("orders.printTitle")}</h2>
                <p>{receiptOrder.code} · {typeLabel(receiptOrder)} · {receiptWidth} mm</p>
              </div>
              <button className="icon-btn" type="button" aria-label={t("action.close")} onClick={() => setReceiptOrder(null)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              <p className="field-hint">{t("orders.printHint")}</p>
              <div className="print-area" style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 14 }}>
                <div className="receipt-paper" data-width={receiptWidth}>
                  <h4>Kantin Mini</h4>
                  <p className="receipt-sub">{t("receipt.kitchen")}</p>
                  <hr />
                  <div className="receipt-line"><span>{t("orders.openCode")}</span><span>{receiptOrder.code}</span></div>
                  <div className="receipt-line"><span>{t("label.type")}</span><span>{typeLabel(receiptOrder)}</span></div>
                  <div className="receipt-line"><span>{t("label.customer")}</span><span>{receiptOrder.customer}</span></div>
                  <div className="receipt-line"><span>{t("label.time")}</span><span>{formatTime(receiptOrder.createdAt, lang)}</span></div>
                  <hr />
                  {receiptItemRows(receiptOrder, false)}
                  <hr />
                  <p className="receipt-center">{t("receipt.kitchen")}</p>
                </div>
                <div className="receipt-paper" data-width={receiptWidth}>
                  <h4>Kantin Mini</h4>
                  <p className="receipt-sub">Jl. Melati No. 8 · Gedung A</p>
                  <p className="receipt-sub">{t("receipt.customer")}</p>
                  <hr />
                  <div className="receipt-line"><span>{t("orders.openCode")}</span><span>{receiptOrder.code}</span></div>
                  <div className="receipt-line"><span>{t("label.type")}</span><span>{typeLabel(receiptOrder)}</span></div>
                  <div className="receipt-line"><span>{t("label.customer")}</span><span>{receiptOrder.customer}</span></div>
                  <div className="receipt-line"><span>{t("label.time")}</span><span>{formatTime(receiptOrder.createdAt, lang)}</span></div>
                  <hr />
                  {receiptItemRows(receiptOrder, true)}
                  <hr />
                  <div className="receipt-total-line"><span>{t("label.total")}</span><span>{KANTIN_DATA.formatIDR(receiptOrder.total)}</span></div>
                  <div className="receipt-line"><span>{receiptOrder.payment}</span><span>{receiptStatus(receiptOrder)}</span></div>
                  <hr />
                  <p className="receipt-thanks">{t("receipt.thankYou")}</p>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" type="button" onClick={() => setReceiptOrder(null)}>{t("action.close")}</button>
              <button className="btn btn-primary" type="button" onClick={() => window.print()}>
                <Icon name="printer" />{t("action.print")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
