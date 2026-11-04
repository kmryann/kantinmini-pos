"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api-client";
import type { ReportSummary } from "@/lib/api-types";
import { formatIDR, formatTime } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export default function CashierReportPage() {
  const { t, lang } = useLanguage();
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Laporan hari ini · Kantin Mini";
  }, [lang]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReport(await api.reports({ period: "today" }));
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const chartData = report?.hourly || [];
  const max = Math.max(...chartData.map((entry) => entry.revenue), 1);
  const rows = useMemo(
    () => (report?.transactions || []).filter((order) => order.paymentStatus === "paid"),
    [report],
  );

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
        <div className="page-actions">
          <span className="badge badge-neutral">
            <Icon name="lock" />
            <span>{t("today.locked")}</span>
          </span>
          <button className="btn btn-sm btn-outline" type="button" onClick={() => void load()}>
            <Icon name="refresh" /><span>{t("orders.refresh")}</span>
          </button>
        </div>
      </div>

      {loading || !report ? (
        <div className="empty-state">
          <span className="empty-icon"><Icon name="refresh" /></span>
          <h3>{lang === "id" ? "Memuat laporan…" : "Loading report…"}</h3>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">{t("today.revenue")}</span><span className="stat-icon"><Icon name="wallet" /></span></div>
              <p className="stat-value">{formatIDR(report.stats.revenue)}</p>
              <p className="stat-meta"><span>{t("today.paidOnly")}</span></p>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">{t("today.transactions")}</span><span className="stat-icon"><Icon name="receipt" /></span></div>
              <p className="stat-value">{report.stats.transactions}</p>
              <p className="stat-meta"><span>{t("today.paidOnly")}</span></p>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">{t("today.average")}</span><span className="stat-icon"><Icon name="chart" /></span></div>
              <p className="stat-value">{formatIDR(report.stats.average)}</p>
              <p className="stat-meta"><span>{t("today.paidOnly")}</span></p>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">{t("today.items")}</span><span className="stat-icon"><Icon name="utensils" /></span></div>
              <p className="stat-value">{report.stats.items}</p>
              <p className="stat-meta"><span>{t("today.paidOnly")}</span></p>
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
                  <strong>{formatIDR(report.stats.revenue)}</strong>
                  <span>{t("dashboard.sales")}</span>
                </div>
                <div className="chart-bars" aria-label={t("today.hourly")}>
                  {chartData.map((entry) => (
                    <div
                      className="chart-bar"
                      title={`${entry.hour}:00 · ${formatIDR(entry.revenue)} · ${entry.value} transaksi`}
                      key={entry.hour}
                      tabIndex={0}
                    >
                      <div
                        className="chart-bar-column"
                        style={{ "--bar-height": `${Math.max(8, Math.round((entry.revenue / max) * 100))}%` } as CSSProperties}
                      >
                        <span className="chart-tooltip">{formatIDR(entry.revenue)}</span>
                      </div>
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
                  <span className="mix-qris" style={{ width: `${report.paymentMix.qris}%` }} />
                  <span className="mix-cash" style={{ width: `${report.paymentMix.cash}%` }} />
                </div>
                <div className="mix-legend">
                  <span><i style={{ background: "var(--green)" }} />{t("label.qris")} · {report.paymentMix.qris}%</span>
                  <span><i style={{ background: "var(--mango)" }} />{t("label.cash")} · {report.paymentMix.cash}%</span>
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
                    <tr key={row.id}>
                      <td className="cell-muted">{formatTime(row.createdAt, lang)}</td>
                      <td className="cell-strong">{row.code}</td>
                      <td>{row.customer}</td>
                      <td className="cell-muted">{typeLabel(row)}</td>
                      <td>{row.payment}</td>
                      <td><span className="badge badge-paid">{t("label.paid")}</span></td>
                      <td className="cell-total">{formatIDR(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
