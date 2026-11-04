"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { KANTIN_DATA } from "@/lib/data";
import { dateKey, formatDate, formatTime } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { readActiveOrder } from "@/lib/customer-storage";

type Transaction = {
  date: string;
  time: string;
  sort: number;
  code: string;
  customer: string;
  type: string;
  table: number | null;
  payment: string;
  status: string;
  total: number;
};

const pageSize = 8;

export default function ReportsPage() {
  const { t, lang } = useLanguage();
  const baseRows = useMemo(() => {
    const list: Transaction[] = [];
    KANTIN_DATA.orders.forEach((order: any) => {
      list.push({
        date: dateKey(order.createdAt),
        time: formatTime(order.createdAt, lang),
        sort: new Date(order.createdAt).getTime(),
        code: order.code,
        customer: order.customer,
        type: order.type,
        table: order.table,
        payment: order.payment,
        status: order.paymentStatus,
        total: order.total,
      });
    });
    KANTIN_DATA.history.forEach((row: any) => {
      list.push({
        date: row.date,
        time: row.time,
        sort: new Date(`${row.date}T${row.time}:00+07:00`).getTime(),
        code: row.code,
        customer: row.customer,
        type: row.type,
        table: row.table,
        payment: row.payment,
        status: row.status,
        total: row.total,
      });
    });
    return list;
  }, [lang]);

  const [rows, setRows] = useState<Transaction[]>(baseRows);
  const minDate = baseRows.length ? [...baseRows].sort((a, b) => a.date.localeCompare(b.date))[0].date : "";
  const maxDate = baseRows.length ? [...baseRows].sort((a, b) => b.date.localeCompare(a.date))[0].date : "";
  const [from, setFrom] = useState(minDate);
  const [to, setTo] = useState(maxDate);
  const [payment, setPayment] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState({ from: minDate, to: maxDate, payment: "all", status: "all", type: "all", search: "" });
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = "Laporan transaksi · Kantin Mini";
  }, [lang]);

  useEffect(() => {
    const active = readActiveOrder();
    if (!active) return;
    setRows((current) => {
      if (current.some((row) => row.code === active.code)) return current;
      return [
        ...current,
        {
          date: dateKey(active.createdAt),
          time: formatTime(active.createdAt, lang),
          sort: new Date(active.createdAt).getTime(),
          code: active.code,
          customer: active.customer,
          type: active.type,
          table: active.table,
          payment: active.payment,
          status: active.paymentStatus,
          total: active.total,
        },
      ];
    });
  }, [lang]);

  const filtered = useMemo(() => {
    const query = applied.search.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (applied.from && row.date < applied.from) return false;
        if (applied.to && row.date > applied.to) return false;
        if (applied.payment !== "all" && row.payment !== applied.payment) return false;
        if (applied.status !== "all" && row.status !== applied.status) return false;
        if (applied.type !== "all" && row.type !== applied.type) return false;
        if (query && !`${row.code} ${row.customer}`.toLowerCase().includes(query)) return false;
        return true;
      })
      .sort((a, b) => b.sort - a.sort);
  }, [rows, applied]);

  const paid = filtered.filter((row) => row.status === "paid");
  const revenue = paid.reduce((sum, row) => sum + row.total, 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const typeLabel = (row: Transaction) =>
    row.type === "takeaway"
      ? t("label.takeaway")
      : `${t("label.dineIn")} · ${t("label.table")} ${String(row.table || 1).padStart(2, "0")}`;

  const statusBadge = (value: string) => {
    const map: Record<string, [string, string]> = {
      paid: ["paid", t("label.paid")],
      pending: ["pending", t("label.pending")],
      expired: ["expired", t("label.expired")],
      cancelled: ["cancelled", t("label.cancelled")],
    };
    const [tone, label] = map[value] || map.pending;
    return <span className={`badge badge-${tone}`}>{label}</span>;
  };

  const apply = (event: FormEvent) => {
    event.preventDefault();
    setApplied({ from, to, payment, status, type, search });
    setPage(1);
  };

  const reset = () => {
    setFrom(minDate);
    setTo(maxDate);
    setPayment("all");
    setStatus("all");
    setType("all");
    setSearch("");
    setApplied({ from: minDate, to: maxDate, payment: "all", status: "all", type: "all", search: "" });
    setPage(1);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2>{t("reports.heading")}</h2>
          <p className="page-subtitle">{t("reports.subtitle")}</p>
        </div>
      </div>

      <div className="report-summary">
        <div className="report-summary-card">
          <p>{t("reports.totalRevenue")}</p>
          <strong>{KANTIN_DATA.formatIDR(revenue)}</strong>
          <span className="cell-muted">{t("reports.revenueNote")}</span>
        </div>
        <div className="report-summary-card">
          <p>{t("reports.totalTransactions")}</p>
          <strong>{filtered.length}</strong>
        </div>
        <div className="report-summary-card">
          <p>{t("reports.avgOrder")}</p>
          <strong>{KANTIN_DATA.formatIDR(paid.length ? Math.round(revenue / paid.length) : 0)}</strong>
        </div>
      </div>

      <form className="filter-bar" onSubmit={apply}>
        <div className="field">
          <label htmlFor="report-from">{t("reports.dateFrom")}</label>
          <input className="input" id="report-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="report-to">{t("reports.dateTo")}</label>
          <input className="input" id="report-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="report-payment">{t("reports.payment")}</label>
          <select className="select" id="report-payment" value={payment} onChange={(event) => setPayment(event.target.value)}>
            <option value="all">{t("reports.allPayments")}</option>
            <option value="QRIS">QRIS</option>
            <option value="Cash">{t("label.cash")}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="report-status">{t("reports.status")}</label>
          <select className="select" id="report-status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">{t("reports.allStatus")}</option>
            <option value="paid">{t("label.paid")}</option>
            <option value="pending">{t("label.pending")}</option>
            <option value="expired">{t("label.expired")}</option>
            <option value="cancelled">{t("label.cancelled")}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="report-type">{t("reports.type")}</label>
          <select className="select" id="report-type" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">{t("reports.allTypes")}</option>
            <option value="dine-in">{t("label.dineIn")}</option>
            <option value="takeaway">{t("label.takeaway")}</option>
          </select>
        </div>
        <div className="field field-grow">
          <label htmlFor="report-search">{t("action.search")}</label>
          <input className="input" id="report-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("reports.searchPlaceholder")} />
        </div>
        <div className="field" style={{ alignSelf: "end" }}>
          <button className="btn btn-primary btn-sm" type="submit"><Icon name="filter" /><span>{t("action.apply")}</span></button>
        </div>
        <div className="field" style={{ alignSelf: "end" }}>
          <button className="btn btn-outline btn-sm" type="button" onClick={reset}>{t("reports.reset")}</button>
        </div>
      </form>

      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title"><Icon name="receipt" /><span>{t("reports.heading")}</span></h3>
          <span className="cell-muted">{t("reports.pageLabel", { page: safePage, total: totalPages })}</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("reports.tableDate")}</th>
                <th>{t("reports.tableCode")}</th>
                <th>{t("reports.tableCustomer")}</th>
                <th>{t("reports.tableType")}</th>
                <th>{t("reports.tablePayment")}</th>
                <th>{t("reports.tableStatus")}</th>
                <th>{t("reports.tableTotal")}</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">{t("reports.empty")}</td></tr>
              ) : pageRows.map((row) => (
                <tr key={row.code}>
                  <td>
                    <strong style={{ fontWeight: 600 }}>{formatDate(row.date, lang, { day: "2-digit", month: "short" })}</strong>
                    <div className="cell-muted">{row.time}</div>
                  </td>
                  <td className="cell-strong">{row.code}</td>
                  <td>{row.customer}</td>
                  <td className="cell-muted">{typeLabel(row)}</td>
                  <td>{row.payment}</td>
                  <td>{statusBadge(row.status)}</td>
                  <td className="cell-total">{KANTIN_DATA.formatIDR(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>{filtered.length ? t("label.showing", { from: (safePage - 1) * pageSize + 1, to: (safePage - 1) * pageSize + pageRows.length, total: filtered.length }) : ""}</span>
          <div className="page-actions">
            <button className="btn btn-sm btn-outline" type="button" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              <Icon name="chevron-left" /><span>{t("action.prev")}</span>
            </button>
            <button className="btn btn-sm btn-outline" type="button" disabled={safePage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
              <span>{t("action.next")}</span><Icon name="chevron-right" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
