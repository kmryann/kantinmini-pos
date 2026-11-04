"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import type { Role, StaffAccount } from "@/lib/api-types";
import { formatDate, formatTime } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

type Account = StaffAccount;

const initials = (name: string) =>
  name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

export default function AccountsPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("cashier");
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Akun staf · Kantin Mini";
    api.accounts()
      .then(setAccounts)
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, [lang]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", modalOpen);
    return () => document.body.classList.remove("modal-open");
  }, [modalOpen]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accounts.filter((account) => {
      if (roleFilter !== "all" && account.role !== roleFilter) return false;
      if (!query) return true;
      return `${account.name} ${account.email}`.toLowerCase().includes(query);
    });
  }, [accounts, search, roleFilter]);

  const openAccount = (id: string | null) => {
    const account = id ? accounts.find((entry) => entry.id === id) : null;
    setEditingId(id);
    setName(account ? account.name : "");
    setEmail(account ? account.email : "");
    setRole(account ? account.role : "cashier");
    setActive(account ? account.active : true);
    setPassword("");
    setModalOpen(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || saving) return;
    if (!editingId && password.trim().length < 6) {
      toast(lang === "id" ? "Kata sandi minimal 6 karakter." : "Password must be at least 6 characters.", "error");
      return;
    }
    setSaving(true);
    try {
      const existing = editingId ? accounts.find((entry) => entry.id === editingId) : null;
      const payload = {
        name: name.trim(),
        email: email.trim(),
        role,
        active,
        ...(password.trim() ? { password: password.trim() } : {}),
      };
      if (existing) {
        const updated = await api.updateAccount(existing.id, payload);
        setAccounts((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
      } else {
        const created = await api.createAccount({ ...payload, password: password.trim() });
        setAccounts((current) => [...current, created]);
      }
      setModalOpen(false);
      toast(t("accounts.saved"));
    } catch (error: any) {
      toast(error?.message || "Akun gagal disimpan.", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, nextActive: boolean) => {
    try {
      const updated = await api.updateAccount(id, { active: nextActive });
      setAccounts((current) => current.map((entry) => entry.id === id ? updated : entry));
      toast(t("accounts.saved"));
    } catch (error: any) {
      toast(error?.message || t("accounts.lastAdmin"), "error");
    }
  };

  const lastLogin = (value: string | null) => {
    if (!value) return t("accounts.never");
    return `${formatDate(value, lang, { day: "numeric", month: "short" })}, ${formatTime(value, lang)}`;
  };

  const roleLabel = (value: Account["role"]) => t(`role.${value}`);

  return (
    <>
      <div className="page-head">
        <div>
          <h2>{t("accounts.heading")}</h2>
          <p className="page-subtitle">{t("accounts.subtitle")}</p>
        </div>
        <button className="btn btn-primary btn-sm" type="button" onClick={() => openAccount(null)}>
          <Icon name="plus" /><span>{t("accounts.add")}</span>
        </button>
      </div>

      <div className="filter-bar">
        <div className="field field-grow">
          <label htmlFor="account-search">{t("action.search")}</label>
          <div className="input-with-icon">
            <Icon name="search" />
            <input className="input" id="account-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("accounts.searchPlaceholder")} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="account-role-filter">{t("accounts.role")}</label>
          <select className="select" id="account-role-filter" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">{t("accounts.roleFilter")}</option>
            <option value="cashier">{t("role.cashier")}</option>
            <option value="manager">{t("role.manager")}</option>
            <option value="admin">{t("role.admin")}</option>
          </select>
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("accounts.name")}</th>
                <th>{t("accounts.role")}</th>
                <th>{t("accounts.status")}</th>
                <th>{t("accounts.lastLogin")}</th>
                <th>{t("accounts.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="table-empty">{lang === "id" ? "Memuat akun…" : "Loading accounts…"}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="table-empty">{t("accounts.empty")}</td></tr>
              ) : filtered.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span className="avatar">{initials(account.name)}</span>
                      <div>
                        <div className="cell-strong">{account.name}</div>
                        <div className="cell-muted">{account.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`role-pill role-pill-${account.role}`}>{roleLabel(account.role)}</span></td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={account.active} onChange={(event) => toggleActive(account.id, event.target.checked)} />
                      <span className="switch-track" />
                      <span className="switch-label">{account.active ? t("label.active") : t("label.inactive")}</span>
                    </label>
                  </td>
                  <td className="cell-muted">{lastLogin(account.lastLoginAt)}</td>
                  <td>
                    <button className="icon-btn" type="button" aria-label={t("action.edit")} onClick={() => openAccount(account.id)}>
                      <Icon name="edit" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen ? (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="account-modal-title">
          <div className="modal-card">
            <div className="modal-head">
              <div>
                <h2 id="account-modal-title">{editingId ? t("accounts.editTitle") : t("accounts.addTitle")}</h2>
                <p>{t("accounts.inviteNote")}</p>
              </div>
              <button className="icon-btn" type="button" aria-label={t("action.close")} onClick={() => setModalOpen(false)}><Icon name="x" /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="field field-full">
                    <label htmlFor="account-name">{t("accounts.name")}</label>
                    <input className="input" id="account-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={60} />
                  </div>
                  <div className="field field-full">
                    <label htmlFor="account-email">{t("accounts.email")}</label>
                    <input className="input" id="account-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={80} />
                  </div>
                  <div className="field field-full">
                    <label htmlFor="account-password">{lang === "id" ? "Kata sandi" : "Password"}</label>
                    <input
                      className="input"
                      id="account-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={editingId ? (lang === "id" ? "Kosongkan jika tidak diubah" : "Leave blank to keep current") : (lang === "id" ? "Minimal 6 karakter" : "At least 6 characters")}
                      minLength={editingId ? undefined : 6}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="account-role">{t("accounts.role")}</label>
                    <select className="select" id="account-role" value={role} onChange={(event) => setRole(event.target.value as Role)}>
                      <option value="cashier">{t("role.cashier")}</option>
                      <option value="manager">{t("role.manager")}</option>
                      <option value="admin">{t("role.admin")}</option>
                    </select>
                  </div>
                  <div className="field">
                    <span className="field-label">{t("accounts.status")}</span>
                    <label className="switch" style={{ minHeight: 42 }}>
                      <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
                      <span className="switch-track" />
                      <span className="switch-label">{t("accounts.activeToggle")}</span>
                    </label>
                  </div>
                </div>
                <p className="field-hint" style={{ marginTop: 14 }}>{t("accounts.inactiveWarning")}</p>
              </div>
              <div className="modal-foot">
                <button className="btn btn-outline" type="button" onClick={() => setModalOpen(false)}>{t("action.cancel")}</button>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "..." : t("action.save")}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
