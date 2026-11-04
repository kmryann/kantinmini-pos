import type { DashboardData, Localized, Order, ReportPoint, ReportSummary, ReportTopMenu } from "@/lib/api-types";
import { dateKey } from "@/lib/format";
import { listOrders } from "@/lib/server/orders";
import { getMenuPayload } from "@/lib/server/menu";

const DAY = 86400000;
const TZ = "Asia/Jakarta";

const jakartaHour = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone: TZ,
  }).format(new Date(value));

const dayLabel = (dateKeyValue: string, lang: "id" | "en"): Localized => {
  const date = new Date(`${dateKeyValue}T12:00:00+07:00`);
  const id = new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: TZ }).format(date);
  const en = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: TZ }).format(date);
  return { id, en };
};

const startJakartaDay = (value: Date | string) => {
  const key = dateKey(value);
  return new Date(`${key}T00:00:00+07:00`);
};

const addDays = (value: Date, days: number) => new Date(value.getTime() + days * DAY);

const paidWithin = (orders: Order[], from: Date, to: Date) =>
  orders.filter((order) => {
    if (order.paymentStatus !== "paid") return false;
    const time = new Date(order.createdAt).getTime();
    return time >= from.getTime() && time <= to.getTime();
  });

const statsFor = (orders: Order[]) => {
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const transactions = orders.length;
  const items = orders.reduce(
    (sum, order) => sum + order.items.reduce((count, item) => count + item.qty, 0),
    0,
  );
  return {
    revenue,
    transactions,
    average: transactions ? Math.round(revenue / transactions) : 0,
    items,
  };
};

const trend = (current: number, previous: number) => {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const paymentMix = (orders: Order[]) => {
  if (!orders.length) return { qris: 0, cash: 0 };
  const qris = orders.filter((order) => order.payment === "QRIS").length;
  const cash = orders.length - qris;
  return {
    qris: Math.round((qris / orders.length) * 100),
    cash: Math.round((cash / orders.length) * 100),
  };
};

const topMenus = (orders: Order[], images: Map<string, string>): ReportTopMenu[] => {
  const map = new Map<string, ReportTopMenu>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = map.get(item.menuId);
      if (existing) {
        existing.count += item.qty;
      } else {
        map.set(item.menuId, {
          menuId: item.menuId,
          name: item.name,
          image: images.get(item.menuId) || "/assets/menu/placeholder.webp",
          count: item.qty,
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5);
};

const seriesFor = (orders: Order[], from: Date, to: Date): ReportPoint[] => {
  const points: ReportPoint[] = [];
  for (let cursor = startJakartaDay(from); cursor <= to; cursor = addDays(cursor, 1)) {
    const key = dateKey(cursor);
    const value = orders
      .filter((order) => dateKey(order.createdAt) === key)
      .reduce((sum, order) => sum + order.total, 0);
    points.push({ label: dayLabel(key, "id"), value, date: key });
  }
  return points;
};

const hourlyFor = (orders: Order[]): { hour: string; value: number; revenue: number }[] => {
  const orderHours = orders.map((order) => Number(jakartaHour(order.createdAt))).filter(Number.isFinite);
  const start = Math.min(7, ...orderHours);
  const end = Math.max(20, ...orderHours);
  const hours = Array.from({ length: end - start + 1 }, (_, index) => String(start + index).padStart(2, "0"));
  return hours.map((hour) => {
    const entries = orders.filter((order) => jakartaHour(order.createdAt) === hour);
    return {
      hour,
      value: entries.length,
      revenue: entries.reduce((sum, order) => sum + order.total, 0),
    };
  });
};

export function periodRange(period: "today" | "week" | "month") {
  const now = new Date();
  const today = startJakartaDay(now);
  if (period === "today") {
    return { from: today, to: now, previousFrom: addDays(today, -1), previousTo: addDays(now, -1) };
  }
  if (period === "month") {
    const from = addDays(today, -29);
    return { from, to: now, previousFrom: addDays(from, -30), previousTo: addDays(now, -30) };
  }
  const from = addDays(today, -6);
  return { from, to: now, previousFrom: addDays(from, -7), previousTo: addDays(now, -7) };
}

export function dateRange(fromValue?: string | null, toValue?: string | null) {
  const now = new Date();
  const from = fromValue ? new Date(`${fromValue}T00:00:00+07:00`) : addDays(startJakartaDay(now), -6);
  const to = toValue ? new Date(`${toValue}T23:59:59.999+07:00`) : now;
  const duration = to.getTime() - from.getTime();
  return {
    from,
    to,
    previousFrom: new Date(from.getTime() - duration - 1),
    previousTo: new Date(from.getTime() - 1),
  };
}

export async function buildReport(from: Date, to: Date, previousFrom: Date, previousTo: Date): Promise<ReportSummary> {
  const orders = await listOrders();
  const menuPayload = await getMenuPayload();
  const menuImages = new Map(menuPayload.menu.map((menu) => [menu.id, menu.image]));
  const paid = paidWithin(orders, from, to);
  const previous = paidWithin(orders, previousFrom, previousTo);
  const currentStats = statsFor(paid);
  const previousStats = statsFor(previous);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    stats: currentStats,
    trends: {
      revenue: trend(currentStats.revenue, previousStats.revenue),
      transactions: trend(currentStats.transactions, previousStats.transactions),
      average: trend(currentStats.average, previousStats.average),
      items: trend(currentStats.items, previousStats.items),
    },
    series: seriesFor(paid, from, to),
    hourly: hourlyFor(paid),
    paymentMix: paymentMix(paid),
    topMenus: topMenus(paid, menuImages),
    transactions: orders
      .filter((order) => {
        const time = new Date(order.createdAt).getTime();
        return time >= from.getTime() && time <= to.getTime();
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  };
}

export async function buildDashboard(period: "today" | "week" | "month"): Promise<DashboardData> {
  const range = periodRange(period);
  const report = await buildReport(range.from, range.to, range.previousFrom, range.previousTo);
  return {
    period,
    from: report.from,
    to: report.to,
    stats: report.stats,
    trends: report.trends,
    series: report.series,
    hourly: report.hourly,
    paymentMix: report.paymentMix,
    topMenus: report.topMenus,
    recentOrders: report.transactions.slice(0, 5),
  };
}
