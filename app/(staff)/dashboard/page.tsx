"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api-client";
import type { DashboardData } from "@/lib/api-types";
import { formatIDR, formatTime } from "@/lib/format";
import { localized } from "@/lib/order-utils";
import { useLanguage } from "@/lib/i18n";

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard · Kantin Mini";
  }, [lang]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.dashboard(period));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void load();
  }, [load]);

  const chartData = useMemo(() => {
    if (!data) return [];
    if (period === "today") {
      return data.hourly.map((entry) => ({
        label: { id: `${entry.hour}:00`, en: `${entry.hour}:00` },
        value: entry.revenue,
        date: data.from,
      }));
    }
    return data.series;
  }, [data, period]);

  const chartMax = Math.max(...chartData.map((entry) => entry.value), 1);
  const chartTotal = chartData.reduce((sum, entry) => sum + entry.value, 0);
  const periodLabel =
    period === "today"
      ? t("dashboard.today")
      : period === "month"
        ? t("dashboard.last30")
        : t("dashboard.last7");

  const trendLabel = (value: number) => {
    const formatted = Math.abs(value).toFixed(1).replace(".", lang === "id" ? "," : ".");
    return `${value >= 0 ? "+" : "-"}${formatted}%`;
  };

  const topMax = Math.max(...(data?.topMenus.map((entry) => entry.count) || [1]), 1);

  const paymentBadge = (status: string) => {
    if (status === "paid") return <span className="badge badge-paid">{t("label.paid")}</span>;
    if (status === "expired") return <span className="badge badge-expired">{t("label.expired")}</span>;
    if (status === "cancelled") return <span className="badge badge-cancelled">{t("label.cancelled")}</span>;
    return <span className="badge badge-pending">{t("label.pending")}</span>;
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2>{t("dashboard.heading")}</h2>
          <p className="page-subtitle">{t("dashboard.subtitle")}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-sm btn-outline" type="button" onClick={() => void load()}>
            <Icon name="refresh" /><span>{t("orders.refresh")}</span>
          </button>
          <Link className="btn btn-sm btn-outline" href="/reports">
            <Icon name="chart" /><span>{t("dashboard.viewReports")}</span>
          </Link>
        </div>
      </div>

      {loading || !data ? (
        <div className="empty-state">
          <span className="empty-icon"><Icon name="refresh" /></span>
          <h3>{lang === "id" ? "Memuat dashboard…" : "Loading dashboard…"}</h3>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">{t("dashboard.revenue")}</span><span className="stat-icon"><Icon name="wallet" /></span></div>
              <p className="stat-value">{formatIDR(data.stats.revenue)}</p>
              <p className="stat-meta"><span className={data.trends.revenue >= 0 ? "trend-up" : "trend-down"}>{trendLabel(data.trends.revenue)}</span><span>{t("dashboard.vsPrev")}</span></p>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">{t("dashboard.transactions")}</span><span className="stat-icon"><Icon name="receipt" /></span></div>
              <p className="stat-value">{data.stats.transactions}</p>
              <p className="stat-meta"><span className={data.trends.transactions >= 0 ? "trend-up" : "trend-down"}>{trendLabel(data.trends.transactions)}</span><span>{t("dashboard.vsPrev")}</span></p>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">{t("dashboard.average")}</span><span className="stat-icon"><Icon name="chart" /></span></div>
              <p className="stat-value">{formatIDR(data.stats.average)}</p>
              <p className="stat-meta"><span className={data.trends.average >= 0 ? "trend-up" : "trend-down"}>{trendLabel(data.trends.average)}</span><span>{t("dashboard.vsPrev")}</span></p>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">{t("dashboard.items")}</span><span className="stat-icon"><Icon name="utensils" /></span></div>
              <p className="stat-value">{data.stats.items}</p>
              <p className="stat-meta"><span className={data.trends.items >= 0 ? "trend-up" : "trend-down"}>{trendLabel(data.trends.items)}</span><span>{t("dashboard.vsPrev")}</span></p>
            </article>
          </div>

          <div className="dashboard-grid">
            <section className="panel chart-card">
              <div className="panel-head">
                <div>
                  <h3 className="panel-title"><Icon name="chart" /><span>{t("dashboard.sales")}</span></h3>
                  <p className="panel-subtitle">{periodLabel}</p>
                </div>
                <div className="segmented" role="group" aria-label={t("dashboard.period")}>
                  {([
                    ["today", t("dashboard.today")],
                    ["week", t("dashboard.week")],
                    ["month", t("dashboard.month")],
                  ] as const).map(([value, label]) => (
                    <button type="button" className={period === value ? "is-active" : ""} key={value} onClick={() => setPeriod(value)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="panel-body">
                <div className="chart-summary">
                  <strong>{formatIDR(chartTotal)}</strong>
                  <span>{t("dashboard.sales")}</span>
                </div>
                <div className="chart-bars" aria-label={t("dashboard.sales")}>
                  {chartData.map((entry, index) => (
                    <div
                      className={`chart-bar ${index === chartData.length - 1 ? "is-today" : ""}`}
                      title={`${localized(entry.label, lang)} · ${formatIDR(entry.value)}`}
                      key={`${entry.label.id}-${index}`}
                      tabIndex={0}
                      aria-label={`${localized(entry.label, lang)}: ${formatIDR(entry.value)}`}
                    >
                      <div className="chart-bar-column" style={{ "--bar-height": `${Math.max(8, Math.round((entry.value / chartMax) * 100))}%` } as CSSProperties}>
                        <span className="chart-tooltip">{formatIDR(entry.value)}</span>
                      </div>
                      <span className="chart-bar-label">{localized(entry.label, lang)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head"><h3 className="panel-title"><Icon name="utensils" /><span>{t("dashboard.topMenus")}</span></h3></div>
              <div className="panel-body">
                <ul className="top-menu-list">
                  {data.topMenus.length === 0 ? (
                    <li className="table-empty">{t("reports.empty")}</li>
                  ) : data.topMenus.map((entry) => (
                    <li className="top-menu-item" key={entry.menuId}>
                      <span className="top-menu-thumb"><img src={entry.image} alt="" width={800} height={800} loading="lazy" decoding="async" /></span>
                      <div className="top-menu-copy">
                        <p>{localized(entry.name, lang)}</p>
                        <div className="top-menu-track"><span style={{ width: `${Math.max(10, Math.round((entry.count / topMax) * 100))}%` }} /></div>
                      </div>
                      <span className="top-menu-count">{entry.count} {t("dashboard.unitSold")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div className="dashboard-bottom">
            <section className="panel">
              <div className="panel-head">
                <h3 className="panel-title"><Icon name="receipt" /><span>{t("dashboard.recentOrders")}</span></h3>
                <Link className="btn btn-ghost btn-sm" href="/reports">
                  <span>{t("dashboard.viewReports")}</span><Icon name="arrow-right" />
                </Link>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t("orders.openCode")}</th>
                      <th>{t("label.customer")}</th>
                      <th>{t("label.time")}</th>
                      <th>{t("label.status")}</th>
                      <th>{t("label.total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.length === 0 ? (
                      <tr><td colSpan={5} className="table-empty">{t("reports.empty")}</td></tr>
                    ) : data.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="cell-strong">{order.code}</td>
                        <td>{order.customer}</td>
                        <td className="cell-muted">{formatTime(order.createdAt, lang)}</td>
                        <td>{paymentBadge(order.paymentStatus)}</td>
                        <td className="cell-total">{formatIDR(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head"><h3 className="panel-title"><Icon name="wallet" /><span>{t("dashboard.paymentMix")}</span></h3></div>
              <div className="panel-body">
                <div className="mix-bar" aria-hidden="true">
                  <span className="mix-qris" style={{ width: `${data.paymentMix.qris}%` }} />
                  <span className="mix-cash" style={{ width: `${data.paymentMix.cash}%` }} />
                </div>
                <div className="mix-legend">
                  <span><i style={{ background: "var(--green)" }} />{t("dashboard.qris")} · {data.paymentMix.qris}%</span>
                  <span><i style={{ background: "var(--mango)" }} />{t("dashboard.cash")} · {data.paymentMix.cash}%</span>
                </div>
                <div className="settings-note" style={{ marginTop: 18 }}>
                  <Icon name="check-circle" /><span>{t("today.paidOnly")}</span>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}
