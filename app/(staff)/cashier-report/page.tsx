"use client";

import { useEffect, useMemo, type CSSProperties } from "react";
import { Icon } from "@/components/Icon";
import { KANTIN_DATA } from "@/lib/data";
import { dateKey, formatTime } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export default function CashierReportPage() {
  const { t, lang } = useLanguage();

  useEffect(() => {
    document.title = "Laporan hari ini · Kantin Mini";
  }, [lang]);

  const chartData = KANTIN_DATA.cashierReport.hourly;
  const max = Math.max(...chartData.map((entry) => entry.value), 1);
  const rows = useMemo(() => {
    const today = dateKey(new Date());
    const map = new Map<string, { code: string; customer: string; type: string; table: number | null; payment: string; total: number; time: string; sort: number }>();
    KANTIN_DATA.orders
      .filter((order) => order.paymentStatus === "paid")
      .forEach((order) => {
        map.set(order.code, {
          code: order.code,
          customer: order.customer,
          type: order.type,
          table: order.table,
          payment: order.payment,
          total: order.total,
          time: formatTime(order.createdAt, lang),
          sort: new Date(order.createdAt).getTime(),
        });
      });
    KANTIN_DATA.history
      .filter((row) => row.date === today && row.status === "paid")
      .forEach((row) => {
        map.set(row.code, {
          code: row.code,
          customer: row.customer,
          type: row.type,
          table: row.table,
          payment: row.payment,
          total: row.total,
          time: row.time,
          sort: new Date(`${row.date}T${row.time}:00+07:00`).getTime(),
        });
      });
    return [...map.values()].sort((a, b) => b.sort - a.sort);
  }, [lang]);

  const typeLabel = (row: { type: string; table: number | null }) =>
    row.type === "takeaway"
      ? t("label.takeaway")
      : `${t("label.dineIn")} · ${t("label.table")} ${String(row.table || 1).padStart(2, "0")}`;

  return (
    <>
      <div className="page-head">
        <div>
          <h2>{t("today.heading")}</h2>
          <p className="page-subtitle">{t("today.subtitle")}</p>
        </div>
        <span className="badge badge-neutral">
          <Icon name="lock" />
          <span>{t("today.locked")}</span>
        </span>
      </div>

      <div className="stat-grid">
        <article className="stat-card">
          <div className="stat-top"><span className="stat-label">{t("today.revenue")}</span><span className="stat-icon"><Icon name="wallet" /></span></div>
          <p className="stat-value">Rp 546.000</p>
          <p className="stat-meta"><span className="trend-up">+9,4%</span><span>{t("dashboard.vsPrev")}</span></p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-label">{t("today.transactions")}</span><span className="stat-icon"><Icon name="receipt" /></span></div>
          <p className="stat-value">21</p>
          <p className="stat-meta"><span className="trend-up">+5,0%</span><span>{t("dashboard.vsPrev")}</span></p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-label">{t("today.average")}</span><span className="stat-icon"><Icon name="chart" /></span></div>
          <p className="stat-value">Rp 26.000</p>
          <p className="stat-meta"><span>{t("today.paidOnly")}</span></p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-label">{t("today.items")}</span><span className="stat-icon"><Icon name="utensils" /></span></div>
          <p className="stat-value">34</p>
          <p className="stat-meta"><span className="trend-up">+11,2%</span><span>{t("dashboard.vsPrev")}</span></p>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="panel chart-card">
          <div className="panel-head">
            <div>
              <h3 className="panel-title"><Icon name="chart" /><span>{t("today.hourly")}</span></h3>
              <p className="panel-subtitle">{t("today.paidOnly")}</p>
            </div>
          </div>
          <div className="panel-body">
            <div className="chart-summary">
              <strong>Rp 546.000</strong>
              <span>{t("dashboard.sales")}</span>
            </div>
            <div className="chart-bars" aria-label={t("today.hourly")}>
              {chartData.map((entry) => (
                <div className="chart-bar" title={`${entry.hour}:00 · ${KANTIN_DATA.formatIDR(entry.value * 26000)}`} key={entry.hour}>
                  <div
                    className="chart-bar-column"
                    style={{ "--bar-height": `${Math.max(8, Math.round((entry.value / max) * 100))}%` } as CSSProperties}
                  />
                  <span className="chart-bar-label">{entry.hour}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h3 className="panel-title"><Icon name="wallet" /><span>{t("today.paymentMix")}</span></h3></div>
          <div className="panel-body">
            <div className="mix-bar" aria-hidden="true">
              <span className="mix-qris" style={{ width: "62%" }} />
              <span className="mix-cash" style={{ width: "38%" }} />
            </div>
            <div className="mix-legend">
              <span><i style={{ background: "var(--green)" }} />{t("label.qris")} · 62%</span>
              <span><i style={{ background: "var(--mango)" }} />{t("label.cash")} · 38%</span>
            </div>
            <div className="settings-note" style={{ marginTop: 18 }}>
              <Icon name="check-circle" />
              <span>{t("today.locked")}</span>
            </div>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <div>
            <h3 className="panel-title"><Icon name="receipt" /><span>{t("today.recent")}</span></h3>
            <p className="panel-subtitle">{t("today.paidOnly")}</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("today.tableDate")}</th>
                <th>{t("today.tableCode")}</th>
                <th>{t("today.customer")}</th>
                <th>{t("today.type")}</th>
                <th>{t("today.payment")}</th>
                <th>{t("today.status")}</th>
                <th>{t("today.total")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">{t("today.empty")}</td></tr>
              ) : rows.map((row) => (
                <tr key={row.code}>
                  <td className="cell-muted">{row.time}</td>
                  <td className="cell-strong">{row.code}</td>
                  <td>{row.customer}</td>
                  <td className="cell-muted">{typeLabel(row)}</td>
                  <td>{row.payment}</td>
                  <td><span className="badge badge-paid">{t("label.paid")}</span></td>
                  <td className="cell-total">{KANTIN_DATA.formatIDR(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
