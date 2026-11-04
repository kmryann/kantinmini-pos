"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/ToastProvider";
import { KANTIN_DATA } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";

type Account = {
  id: string;
  name: string;
  email: string;
  role: "cashier" | "manager" | "admin";
  active: boolean;
  lastLogin: string;
};

export default function AccountsPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const [accounts, setAccounts] = useState<Account[]>(() => KANTIN_DATA.accounts.map((entry: Account) => ({ ...entry })));
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Account["role"]>("cashier");
  const [active, setActive] = useState(true);

  useEffect(() => {
    document.title = "Akun staf · Kantin Mini";
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
    setModalOpen(true);
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const existing = editingId ? accounts.find((entry) => entry.id === editingId) : null;
    const activeAdmins = accounts.filter((entry) => entry.role === "admin" && entry.active);
    if (existing && existing.role === "admin" && (role !== "admin" || !active) && activeAdmins.length <= 1) {
      toast(t("accounts.lastAdmin"), "error");
      return;
    }
    const next = existing
      ? accounts.map((entry) => entry.id === existing.id ? { ...entry, name: name.trim(), email: email.trim(), role, active } : entry)
      : [
          ...accounts,
          { id: `u-${Date.now()}`, name: name.trim(), email: email.trim(), role, active, lastLogin: t("accounts.never") },
        ];
    setAccounts(next);
    KANTIN_DATA.accounts.splice(0, KANTIN_DATA.accounts.length, ...next);
    setModalOpen(false);
    toast(t("accounts.saved"));
  };

  const toggleActive = (id: string, nextActive: boolean) => {
    const account = accounts.find((entry) => entry.id === id);
    if (!account) return;
    if (!nextActive && account.role === "admin" && accounts.filter((entry) => entry.role === "admin" && entry.active).length <= 1) {
      toast(t("accounts.lastAdmin"), "error");
      return;
    }
    const next = accounts.map((entry) => entry.id === id ? { ...entry, active: nextActive } : entry);
    setAccounts(next);
    KANTIN_DATA.accounts.splice(0, KANTIN_DATA.accounts.length, ...next);
    toast(t("accounts.saved"));
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
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="table-empty">{t("accounts.empty")}</td></tr>
              ) : filtered.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span className="avatar">{KANTIN_DATA.initials(account.name)}</span>
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
                  <td className="cell-muted">{account.lastLogin || t("accounts.never")}</td>
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
                  <div className="field">
                    <label htmlFor="account-role">{t("accounts.role")}</label>
                    <select className="select" id="account-role" value={role} onChange={(event) => setRole(event.target.value as Account["role"])}>
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
                <button className="btn btn-primary" type="submit">{t("action.save")}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
