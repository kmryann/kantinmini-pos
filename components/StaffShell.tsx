"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/lib/i18n";
import {
  allowedPages,
  defaultRoleForPath,
  homeForRole,
  isRole,
  navConfig,
  normalizePath,
  pageTitles,
  roleUsers,
  type Role,
} from "@/lib/staff";

export function StaffShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const path = normalizePath(pathname);
  const [role, setRole] = useState<Role | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("kantin-demo-role");
    } catch {
      stored = null;
    }
    const selected = isRole(stored) ? stored : defaultRoleForPath(path);
    const allowed = allowedPages[path];
    if (allowed && !allowed.includes(selected)) {
      router.replace(homeForRole(selected));
      return;
    }
    setRole(selected);
  }, [path, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [path]);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  useEffect(() => {
    setDateLabel(
      new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    );
  }, [lang]);

  const effectiveRole = role ?? defaultRoleForPath(path);
  const user = roleUsers[effectiveRole];
  const title = pageTitles[path] ? pageTitles[path][lang] : "Kantin Mini";
  const sections = useMemo(
    () =>
      navConfig
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => item.roles.includes(effectiveRole)),
        }))
        .filter((section) => section.items.length > 0),
    [effectiveRole],
  );

  const logout = () => {
    try {
      localStorage.removeItem("kantin-demo-role");
    } catch {
      // Storage may be unavailable.
    }
    router.push("/login");
  };

  return (
    <div className="app-shell min-h-screen">
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-inner">
          <div className="sidebar-brand">
            <Link className="brand brand-side" href="/" aria-label="Kantin Mini">
              <span className="brand-mark">
                <Icon name="logo-mark" className="logo" />
              </span>
              <span className="brand-word">
                Kantin <em>Mini</em>
              </span>
            </Link>
          </div>
          <nav className="side-nav" aria-label={t("nav.workspace")}>
            {sections.map((section) => (
              <div className="side-section" key={section.key}>
                <p className="side-section-label">{t(section.key)}</p>
                <div className="side-links">
                  {section.items.map((item) => {
                    const active = path === item.href;
                    return (
                      <Link
                        className={`side-link ${active ? "is-active" : ""}`}
                        href={item.href}
                        key={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon name={item.icon} />
                        <span>{t(item.label)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <Link className="side-link side-link-muted" href="/">
              <Icon name="external" />
              <span>{t("nav.openSite")}</span>
            </Link>
            <button className="side-link side-link-muted" type="button" onClick={logout}>
              <Icon name="log-out" />
              <span>{t("nav.logout")}</span>
            </button>
          </div>
        </div>
      </aside>

      <div
        className="sidebar-backdrop"
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <header className="topbar flex items-center justify-between gap-5" id="topbar">
          <div className="topbar-left flex items-center gap-3">
            <button
              className="icon-btn sidebar-toggle"
              type="button"
              aria-label={t("nav.workspace")}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((value) => !value)}
            >
              <Icon name="menu" />
            </button>
            <div className="topbar-heading">
              <p className="topbar-eyebrow">{t(`role.${effectiveRole}`)}</p>
              <h1 className="topbar-title">{title}</h1>
            </div>
          </div>
          <div className="topbar-right flex items-center gap-3">
            {dateLabel ? (
              <span className="topbar-date">
                <Icon name="calendar" />
                <span>{dateLabel}</span>
              </span>
            ) : null}
            <LanguageSwitch />
            <div className="user-chip">
              <span className="avatar">{user.initials}</span>
              <span className="user-chip-copy">
                <strong>{user.short}</strong>
                <small>{t(`role.${effectiveRole}`)}</small>
              </span>
            </div>
          </div>
        </header>
        <main className="page min-h-[calc(100vh-78px)]" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
