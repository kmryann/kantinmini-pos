import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/order"],
        disallow: [
          "/api/",
          "/login",
          "/pos",
          "/orders",
          "/dashboard",
          "/reports",
          "/cashier-report",
          "/menus",
          "/accounts",
          "/settings",
          "/checkout",
          "/cart",
          "/payment",
          "/status",
          "/whatsapp-status",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
