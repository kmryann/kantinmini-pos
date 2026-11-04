"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Icon } from "@/components/Icon";
import { KANTIN_DATA } from "@/lib/data";
import { formatTime } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

const monthSeries = [820000, 940000, 1010000, 890000, 1120000, 1260000, 1180000, 1320000, 1460000, 1285000];
const todaySeries = [35000, 55000, 70000, 95000, 110000, 80000, 60000, 41000];

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");

  useEffect(() => {
    document.title = "Dashboard · Kantin Mini";
  }, [lang]);

  const chartData = useMemo(() => {
    if (period === "today") {
      return KANTIN_DATA.cashierReport.hourly.map((entry: { hour: string; value: number }, index: number) => ({
        label: { id: entry.hour, en: entry.hour },
        value: todaySeries[index] || 0,
      }));
    }
    if (period === "month") {
      return monthSeries.map((value, index) => ({
        label: { id: String(index * 3 + 1), en: String(index * 3 + 1) },
        value,
      }));
    }
    return KANTIN_DATA.dashboard.sales7d;
  }, [period]);

  const chartMax = Math.max(...chartData.map((entry: { value: number }) => entry.value), 1);
  const chartTotal = chartData.reduce((sum: number, entry: { value: number }) => sum + entry.value, 0);
  const periodLabel =
    period === "today"
      ? t("dashboard.today")
      : period === "month"
        ? t("dashboard.last30")
        : t("dashboard.last7");
  const recentOrders = useMemo(
    () => [...KANTIN_DATA.orders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [],
  );
  const topMenus = KANTIN_DATA.dashboard.topMenus;
  const topMax = Math.max(...topMenus.map((entry: { count: number }) => entry.count), 1);

  const paymentBadge = (status: string) => {
    if (status === "paid") return <span className="badge badge-paid">{t("label.paid")}</span>;
    if (status === "expired") return <span className="badge badge-expired">{t("label.expired")}</span>;
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
          <span className="badge badge-neutral"><Icon name="clock" /><span>{t("label.today")}</span></span>
          <Link className="btn btn-sm btn-outline" href="/reports">
            <Icon name="chart" /><span>{t("dashboard.viewReports")}</span>
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <article className="stat-card">
          <div className="stat-top"><span className="stat-label">{t("dashboard.revenue")}</span><span className="stat-icon"><Icon name="wallet" /></span></div>
          <p className="stat-value">Rp 546.000</p>
          <p className="stat-meta"><span className="trend-up">+9,4%</span><span>{t("dashboard.vsPrev")}</span></p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-label">{t("dashboard.transactions")}</span><span className="stat-icon"><Icon name="receipt" /></span></div>
          <p className="stat-value">21</p>
          <p className="stat-meta"><span className="trend-up">+5,0%</span><span>{t("dashboard.vsPrev")}</span></p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-label">{t("dashboard.average")}</span><span className="stat-icon"><Icon name="chart" /></span></div>
          <p className="stat-value">Rp 26.000</p>
          <p className="stat-meta"><span className="trend-up">+3,2%</span><span>{t("dashboard.vsPrev")}</span></p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-label">{t("dashboard.items")}</span><span className="stat-icon"><Icon name="utensils" /></span></div>
          <p className="stat-value">34</p>
          <p className="stat-meta"><span className="trend-up">+11,2%</span><span>{t("dashboard.vsPrev")}</span></p>
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
              <strong>{KANTIN_DATA.formatIDR(chartTotal)}</strong>
              <span>{t("dashboard.sales")}</span>
            </div>
            <div className="chart-bars" aria-label={t("dashboard.sales")}>
              {chartData.map((entry: { label: { id: string; en: string }; value: number }, index: number) => (
                <div
                  className={`chart-bar ${index === chartData.length - 1 ? "is-today" : ""}`}
                  title={`${KANTIN_DATA.localized(entry.label, lang)} · ${KANTIN_DATA.formatIDR(entry.value)}`}
                  key={`${entry.label.id}-${index}`}
                  tabIndex={0}
                  aria-label={`${KANTIN_DATA.localized(entry.label, lang)}: ${KANTIN_DATA.formatIDR(entry.value)}`}
                >
                  <div className="chart-bar-column" style={{ "--bar-height": `${Math.max(8, Math.round((entry.value / chartMax) * 100))}%` } as CSSProperties}>
                    <span className="chart-tooltip">{KANTIN_DATA.formatIDR(entry.value)}</span>
                  </div>
                  <span className="chart-bar-label">{KANTIN_DATA.localized(entry.label, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h3 className="panel-title"><Icon name="utensils" /><span>{t("dashboard.topMenus")}</span></h3></div>
          <div className="panel-body">
            <ul className="top-menu-list">
              {topMenus.map((entry: { menuId: string; count: number }) => {
                const menu = KANTIN_DATA.menuById(entry.menuId);
                if (!menu) return null;
                return (
                  <li className="top-menu-item" key={entry.menuId}>
                    <span className="top-menu-thumb"><img src={menu.image} alt="" width={800} height={800} loading="lazy" decoding="async" /></span>
                    <div className="top-menu-copy">
                      <p>{KANTIN_DATA.localized(menu.name, lang)}</p>
                      <div className="top-menu-track"><span style={{ width: `${Math.max(10, Math.round((entry.count / topMax) * 100))}%` }} /></div>
                    </div>
                    <span className="top-menu-count">{entry.count} {t("dashboard.unitSold")}</span>
                  </li>
                );
              })}
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
                {recentOrders.map((order: any) => (
                  <tr key={order.code}>
                    <td className="cell-strong">{order.code}</td>
                    <td>{order.customer}</td>
                    <td className="cell-muted">{formatTime(order.createdAt, lang)}</td>
                    <td>{paymentBadge(order.paymentStatus)}</td>
                    <td className="cell-total">{KANTIN_DATA.formatIDR(order.total)}</td>
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
              <span className="mix-qris" style={{ width: "68%" }} />
              <span className="mix-cash" style={{ width: "32%" }} />
            </div>
            <div className="mix-legend">
              <span><i style={{ background: "var(--green)" }} />{t("dashboard.qris")} · 68%</span>
              <span><i style={{ background: "var(--mango)" }} />{t("dashboard.cash")} · 32%</span>
            </div>
            <div className="settings-note" style={{ marginTop: 18 }}>
              <Icon name="check-circle" /><span>{t("today.paidOnly")}</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
