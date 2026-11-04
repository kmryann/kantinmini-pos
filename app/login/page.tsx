"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = `${t("login.title")} · Kantin Mini`;
  }, [lang, t]);

  const enterAs = (role: "cashier" | "manager" | "admin", href: string) => {
    try {
      localStorage.setItem("kantin-demo-role", role);
    } catch {
      // Storage may be unavailable.
    }
    router.push(href);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(true);
      return;
    }
    setError(false);
    enterAs("cashier", "/pos");
  };

  return (
    <div className="login-shell min-h-screen">
      <section className="login-visual">
        <Link className="brand" href="/" aria-label="Kantin Mini">
          <span className="brand-mark"><Icon name="logo-mark" className="logo" /></span>
          <span className="brand-word">Kantin <em>Mini</em></span>
        </Link>
        <p className="login-quote">{t("login.tagline")}</p>
        <div className="login-visual-foot">
          <span>{t("login.secure")}</span>
          <span>Kantin Mini · Gedung A</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-top">
          <Link href="/">
            <Icon name="arrow-left" />
            <span>{t("login.back")}</span>
          </Link>
          <LanguageSwitch />
        </div>

        <div className="login-card">
          <h1>{t("login.title")}</h1>
          <p>{t("login.subtitle")}</p>

          <form className="login-form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="login-email">{t("login.email")}</label>
              <div className="input-with-icon">
                <Icon name="user" />
                <input
                  className="input"
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("login.emailPlaceholder")}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="login-password">{t("login.password")}</label>
              <div className="password-wrap">
                <input
                  className="input"
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={t(showPassword ? "login.hidePassword" : "login.showPassword")}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} />
                </button>
              </div>
            </div>
            <div className="login-options">
              <label className="checkbox-row">
                <input type="checkbox" name="remember" />
                <span>{t("login.remember")}</span>
              </label>
              <span />
            </div>
            {error ? <p className="login-error is-visible" role="alert">{t("login.invalid")}</p> : null}
            <button className="btn btn-primary btn-block" type="submit">{t("login.submit")}</button>
          </form>

          <div className="login-demo">
            <div className="login-demo-head">
              <h2>{t("login.demo")}</h2>
              <span>{t("login.demoBadge")}</span>
            </div>
            <p>{t("login.demoDesc")}</p>
            <div className="demo-roles">
              <button className="demo-role" type="button" onClick={() => enterAs("cashier", "/pos")}>
                <Icon name="layout" />
                <strong>{t("login.cashier")}</strong>
                <small>POS</small>
              </button>
              <button className="demo-role" type="button" onClick={() => enterAs("manager", "/dashboard")}>
                <Icon name="chart" />
                <strong>{t("login.manager")}</strong>
                <small>Dashboard</small>
              </button>
              <button className="demo-role" type="button" onClick={() => enterAs("admin", "/settings")}>
                <Icon name="settings" />
                <strong>{t("login.admin")}</strong>
                <small>Admin</small>
              </button>
            </div>
          </div>
        </div>

        <p className="login-footer">{t("login.footer")}</p>
      </section>
    </div>
  );
}
