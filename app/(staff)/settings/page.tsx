"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/lib/i18n";

type Tab = "profile" | "tables" | "printer" | "payment";

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
};

export default function SettingsPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("profile");
  const [name, setName] = useState("Kantin Mini");
  const [tagline, setTagline] = useState("Kantin lingkungan, rasa rumahan.");
  const [address, setAddress] = useState("Jl. Melati No. 8, Gedung A, Lantai 1");
  const [hours, setHours] = useState("Senin–Sabtu, 07.00–15.00");
  const [description, setDescription] = useState("Kantin lingkungan dengan rasa rumahan. Pesan dari meja, bayar caramu.");
  const [logoPreview, setLogoPreview] = useState("/assets/favicon.svg");
  const [width, setWidth] = useState("80");
  const [autoKitchen, setAutoKitchen] = useState(true);
  const [autoCustomer, setAutoCustomer] = useState(true);
  const [env, setEnv] = useState("sandbox");
  const [clientKey, setClientKey] = useState("SB-Mid-client-KantinMiniDemo");
  const [serverKey, setServerKey] = useState("SB-Mid-server-KantinMiniDemo");
  const [webhook, setWebhook] = useState("https://kantinmini.id/api/midtrans/webhook");

  useEffect(() => {
    document.title = "Pengaturan · Kantin Mini";
  }, [lang]);

  useEffect(() => {
    const profile = readJSON<any>("kantin-settings", null);
    if (profile) {
      setName(profile.name || name);
      setTagline(profile.tagline || tagline);
      setAddress(profile.address || address);
      setHours(profile.hours || hours);
      setDescription(profile.description || description);
    }
    try {
      setWidth(localStorage.getItem("kantin-receipt-width") === "58" ? "58" : "80");
    } catch {
      setWidth("80");
    }
    const printer = readJSON<any>("kantin-print-settings", { kitchen: true, customer: true });
    setAutoKitchen(printer.kitchen !== false);
    setAutoCustomer(printer.customer !== false);
    const midtrans = readJSON<any>("kantin-midtrans", null);
    if (midtrans) {
      setEnv(midtrans.env === "production" ? "production" : "sandbox");
      setClientKey(midtrans.client || clientKey);
      setServerKey(midtrans.server || serverKey);
      setWebhook(midtrans.webhook || webhook);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem("kantin-settings", JSON.stringify({ name, tagline, address, hours, description }));
    toast(t("settings.settingsSaved"));
  };

  const savePrinter = () => {
    localStorage.setItem("kantin-receipt-width", width);
    localStorage.setItem("kantin-print-settings", JSON.stringify({ kitchen: autoKitchen, customer: autoCustomer }));
    toast(t("settings.settingsSaved"));
  };

  const savePayment = () => {
    localStorage.setItem("kantin-midtrans", JSON.stringify({ env, client: clientKey, server: serverKey, webhook }));
    toast(t("settings.settingsSaved"));
  };

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhook);
    } catch {
      // Clipboard may be unavailable.
    }
    toast(t("settings.copied"));
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: t("settings.tabProfile") },
    { id: "tables", label: t("settings.tabTables") },
    { id: "printer", label: t("settings.tabPrinter") },
    { id: "payment", label: t("settings.tabPayment") },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h2>{t("settings.heading")}</h2>
          <p className="page-subtitle">{t("settings.subtitle")}</p>
        </div>
      </div>

      <div className="settings-tabs" role="tablist">
        {tabs.map((entry) => (
          <button className={`settings-tab ${tab === entry.id ? "is-active" : ""}`} type="button" role="tab" aria-selected={tab === entry.id} key={entry.id} onClick={() => setTab(entry.id)}>
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <form onSubmit={saveProfile}>
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3 className="panel-title"><Icon name="store" /><span>{t("settings.profileTitle")}</span></h3>
                <p className="panel-subtitle">{t("settings.profileDesc")}</p>
              </div>
            </div>
            <div className="panel-body">
              <div className="form-grid">
                <div className="field"><label htmlFor="profile-name">{t("settings.name")}</label><input className="input" id="profile-name" value={name} onChange={(event) => setName(event.target.value)} /></div>
                <div className="field"><label htmlFor="profile-tagline">{t("settings.tagline")}</label><input className="input" id="profile-tagline" value={tagline} onChange={(event) => setTagline(event.target.value)} /></div>
                <div className="field field-full"><label htmlFor="profile-address">{t("settings.address")}</label><input className="input" id="profile-address" value={address} onChange={(event) => setAddress(event.target.value)} /></div>
                <div className="field"><label htmlFor="profile-hours">{t("settings.hours")}</label><input className="input" id="profile-hours" value={hours} onChange={(event) => setHours(event.target.value)} /></div>
                <div className="field">
                  <span className="field-label">{t("settings.logo")}</span>
                  <label className="photo-drop" htmlFor="profile-logo-file">
                    <img src={logoPreview} alt="" />
                    <span className="photo-drop-copy"><strong>{t("settings.logo")}</strong><small>{t("settings.logoHint")}</small></span>
                    <span className="btn btn-sm btn-outline">{t("menus.choosePhoto")}</span>
                    <input
                      id="profile-logo-file"
                      type="file"
                      accept="image/svg+xml,image/png"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) setLogoPreview(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                </div>
                <div className="field field-full"><label htmlFor="profile-description">{t("settings.description")}</label><textarea className="textarea" id="profile-description" value={description} onChange={(event) => setDescription(event.target.value)} /></div>
              </div>
              <div className="form-actions"><button className="btn btn-primary" type="submit">{t("settings.saveProfile")}</button></div>
            </div>
          </section>
        </form>
      ) : null}

      {tab === "tables" ? (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title"><Icon name="qr" /><span>{t("settings.tablesTitle")}</span></h3>
              <p className="panel-subtitle">{t("settings.tablesDesc")}</p>
            </div>
          </div>
          <div className="panel-body">
            <div className="qr-grid">
              {[1, 2, 3, 4, 5, 6, 7].map((number) => (
                <div className="qr-card" key={number}>
                  <img src={`/assets/qr/meja-${number}.svg`} alt={`QR Meja ${number}`} />
                  <strong>{t("settings.tableLabel")} {String(number).padStart(2, "0")}</strong>
                  <a href={`/assets/qr/meja-${number}.svg`} download={`kantin-meja-${number}.svg`}><Icon name="download" /><span>{t("settings.download")}</span></a>
                </div>
              ))}
              <div className="qr-card">
                <img src="/assets/qr/takeaway.svg" alt="QR Takeaway" />
                <strong>{t("settings.takeawayLabel")}</strong>
                <a href="/assets/qr/takeaway.svg" download="kantin-takeaway.svg"><Icon name="download" /><span>{t("settings.download")}</span></a>
              </div>
            </div>
            <div className="settings-note"><Icon name="qr" /><span>{t("settings.qrHint")}</span></div>
          </div>
        </section>
      ) : null}

      {tab === "printer" ? (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title"><Icon name="printer" /><span>{t("settings.printerTitle")}</span></h3>
              <p className="panel-subtitle">{t("settings.printerDesc")}</p>
            </div>
          </div>
          <div className="panel-body">
            <div className="settings-row">
              <div className="settings-row-copy"><strong>{t("settings.width")}</strong><p>{t("settings.printNote")}</p></div>
              <div className="segmented">
                <button type="button" className={width === "58" ? "is-active" : ""} onClick={() => setWidth("58")}>58 mm</button>
                <button type="button" className={width === "80" ? "is-active" : ""} onClick={() => setWidth("80")}>80 mm</button>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-row-copy"><strong>{t("settings.autoKitchen")}</strong><p>{t("label.autoPrint")}</p></div>
              <label className="switch"><input type="checkbox" checked={autoKitchen} onChange={(event) => setAutoKitchen(event.target.checked)} /><span className="switch-track" /></label>
            </div>
            <div className="settings-row">
              <div className="settings-row-copy"><strong>{t("settings.autoCustomer")}</strong><p>{t("label.autoPrint")}</p></div>
              <label className="switch"><input type="checkbox" checked={autoCustomer} onChange={(event) => setAutoCustomer(event.target.checked)} /><span className="switch-track" /></label>
            </div>
            <div className="settings-row" style={{ display: "block" }}>
              <div className="settings-row-copy" style={{ marginBottom: 12 }}><strong>{t("settings.preview")}</strong><p>{t("settings.printerPreviewTitle")}</p></div>
              <div className="receipt-preview">
                <div className="print-area">
                  <div className="receipt-paper" data-width={width}>
                    <h4>Kantin Mini</h4>
                    <p className="receipt-sub">Jl. Melati No. 8 · Gedung A</p>
                    <hr />
                    <div className="receipt-line"><span>{t("orders.openCode")}</span><span>A-012</span></div>
                    <div className="receipt-line"><span>{t("label.type")}</span><span>{t("label.takeaway")}</span></div>
                    <div className="receipt-line"><span>{t("label.customer")}</span><span>Raka</span></div>
                    <hr />
                    <div className="receipt-line"><span>Ayam Geprek × 2</span><span>Rp 48.000</span></div>
                    <div className="receipt-line"><span>Es Teh Manis × 2</span><span>Rp 16.000</span></div>
                    <hr />
                    <div className="receipt-total-line"><span>{t("label.total")}</span><span>Rp 64.000</span></div>
                    <div className="receipt-line"><span>{t("label.cash")}</span><span>{t("label.paid")}</span></div>
                    <hr />
                    <p className="receipt-thanks">{t("receipt.thankYou")}</p>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline" type="button" onClick={() => window.print()}><Icon name="printer" /><span>{t("action.printTest")}</span></button>
              </div>
            </div>
            <div className="form-actions"><button className="btn btn-primary" type="button" onClick={savePrinter}>{t("action.save")}</button></div>
          </div>
        </section>
      ) : null}

      {tab === "payment" ? (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title"><Icon name="wallet" /><span>{t("settings.paymentTitle")}</span></h3>
              <p className="panel-subtitle">{t("settings.paymentDesc")}</p>
            </div>
            <span className="badge badge-paid"><Icon name="check" /><span>{t("settings.configured")}</span></span>
          </div>
          <div className="panel-body">
            <div className="settings-row">
              <div className="settings-row-copy"><strong>{t("settings.environment")}</strong><p>Midtrans</p></div>
              <div className="segmented">
                <button type="button" className={env === "sandbox" ? "is-active" : ""} onClick={() => setEnv("sandbox")}>{t("settings.sandbox")}</button>
                <button type="button" className={env === "production" ? "is-active" : ""} onClick={() => setEnv("production")}>{t("settings.production")}</button>
              </div>
            </div>
            <div className="form-grid" style={{ marginTop: 16 }}>
              <div className="field field-full"><label htmlFor="midtrans-client">{t("settings.clientKey")}</label><input className="input" id="midtrans-client" value={clientKey} onChange={(event) => setClientKey(event.target.value)} autoComplete="off" /></div>
              <div className="field field-full"><label htmlFor="midtrans-server">{t("settings.serverKey")}</label><input className="input" id="midtrans-server" type="password" value={serverKey} onChange={(event) => setServerKey(event.target.value)} autoComplete="off" /><span className="field-hint">{t("settings.serverKeyHint")}</span></div>
              <div className="field field-full">
                <label htmlFor="midtrans-webhook">{t("settings.webhook")}</label>
                <div className="copy-row"><input className="input" id="midtrans-webhook" value={webhook} onChange={(event) => setWebhook(event.target.value)} readOnly /><button className="btn btn-outline btn-sm" type="button" onClick={copyWebhook}><Icon name="copy" /><span>{t("settings.copy")}</span></button></div>
              </div>
            </div>
            <div className="settings-note"><Icon name="lock" /><span>{t("settings.serverNote")}</span></div>
            <div className="form-actions"><button className="btn btn-primary" type="button" onClick={savePayment}>{t("settings.savePayment")}</button></div>
          </div>
        </section>
      ) : null}
    </>
  );
}
