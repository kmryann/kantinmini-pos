"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { api } from "@/lib/api-client";
import type { PublicSettings } from "@/lib/api-types";
import { useLanguage } from "@/lib/i18n";

export default function LandingPage() {
  const { t, lang } = useLanguage();
  const [slide, setSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [site, setSite] = useState<PublicSettings | null>(null);

  const extra =
    lang === "id"
      ? {
          navLabel: "Navigasi utama",
          menuOpen: "Buka menu",
          menuClose: "Tutup menu",
          about: "Tentang",
          location: "Lokasi",
          contact: "Kontak",
          orderCta: "Pesan",
          ctaWhatsapp: "Chat WhatsApp",
          aboutLabel: "Tentang kami",
          aboutTitle: "Kantin kecil, perhatian besar.",
          aboutLead:
            "Kantin Mini adalah tempat makan sederhana di lingkunganmu. Kami memasak makanan yang familiar, menyajikannya cepat, dan membuat siapa pun merasa seperti makan di rumah.",
          slides: [
            {
              image: "/assets/menu/nasi-goreng.webp",
              title: "Kantin lingkungan",
              body: "Tempat singgah yang akrab, dengan meja untuk makan santai atau pesan dibawa pulang.",
            },
            {
              image: "/assets/menu/nasi-ayam.webp",
              title: "Masakan rumahan",
              body: "Menu yang familiar, bumbu yang tidak berlebihan, dan porsi yang cukup untuk makan siang.",
            },
            {
              image: "/assets/menu/kopi-susu.webp",
              title: "Dibuat saat dipesan",
              body: "Pesanan masuk dapur setelah dibayar. Kopi, nasi, dan lauk disiapkan segar untukmu.",
            },
          ],
          locationLabel: "Lokasi",
          locationTitle: "Mampir, atau pesan dari meja.",
          locationLead:
            "Kami ada di lantai 1, dekat lobi. Singgah untuk makan langsung atau pindai QR di meja untuk memesan.",
          addressLabel: "Alamat",
          address: "Jl. Melati No. 8, Gedung A, Lantai 1",
          hoursLabel: "Jam operasional",
          hours: "Senin–Sabtu, 07.00–15.00",
          whatsappLabel: "WhatsApp",
          openMap: "Buka di Google Maps",
          contactLabel: "Kontak",
          contactTitle: "Ada pertanyaan? Chat kami.",
          contactLead:
            "Untuk pertanyaan menu, pesanan, atau kerja sama, WhatsApp adalah jalur tercepat. Kami balas pada jam operasional.",
          contactNote: "Balasan pada Senin–Sabtu, 07.00–15.00.",
          socialTitle: "Ikuti kantin kami",
          instagram: "Instagram",
          tiktok: "TikTok",
          orderNow: "Pesan sekarang",
          footerAbout: "Tentang",
          footerContact: "Kontak",
        }
      : {
          navLabel: "Main navigation",
          menuOpen: "Open menu",
          menuClose: "Close menu",
          about: "About",
          location: "Location",
          contact: "Contact",
          orderCta: "Order",
          ctaWhatsapp: "Chat on WhatsApp",
          aboutLabel: "About us",
          aboutTitle: "A small canteen with a lot of care.",
          aboutLead:
            "Kantin Mini is a simple neighborhood canteen. We cook familiar food, serve it quickly, and make everyone feel at home.",
          slides: [
            {
              image: "/assets/menu/nasi-goreng.webp",
              title: "Neighborhood canteen",
              body: "A familiar place to sit down for lunch or grab something to take away.",
            },
            {
              image: "/assets/menu/nasi-ayam.webp",
              title: "Home-style cooking",
              body: "Familiar dishes, balanced seasoning, and portions that actually fill you up.",
            },
            {
              image: "/assets/menu/kopi-susu.webp",
              title: "Made when you order",
              body: "Orders reach the kitchen after payment. Rice, sides, and coffee are prepared fresh.",
            },
          ],
          locationLabel: "Location",
          locationTitle: "Drop by, or order from your table.",
          locationLead:
            "Find us on level 1, near the lobby. Eat in or scan the QR at your table to order.",
          addressLabel: "Address",
          address: "8 Melati St, Building A, Level 1",
          hoursLabel: "Opening hours",
          hours: "Mon–Sat, 07.00–15.00",
          whatsappLabel: "WhatsApp",
          openMap: "Open in Google Maps",
          contactLabel: "Contact",
          contactTitle: "Questions? Chat with us.",
          contactLead:
            "WhatsApp is the fastest way to ask about the menu, an order, or a partnership. We reply during opening hours.",
          contactNote: "Replies Mon–Sat, 07.00–15.00.",
          socialTitle: "Follow the canteen",
          instagram: "Instagram",
          tiktok: "TikTok",
          orderNow: "Order now",
          footerAbout: "About",
          footerContact: "Contact",
        };

  const whatsappDisplay = "0851-1769-3117";
  const whatsappLink = "https://wa.me/6285117693117";
  const contactAddress = site?.address || extra.address;
  const contactHours = site?.hours || extra.hours;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactAddress)}`;
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(contactAddress)}&z=15&output=embed`;

  useEffect(() => {
    document.title = t("pageTitle");
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("metaDescription"));
  }, [lang, t]);

  useEffect(() => {
    api.settings().then(setSite).catch(() => setSite(null));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        {t("skipLink")}
      </a>

      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="shell header-inner">
          <Link className="brand" href="/" aria-label="Kantin Mini">
            <span className="brand-mark">
              <Icon name="logo-mark" className="logo" />
            </span>
            <span className="brand-word">
              Kantin <em>Mini</em>
            </span>
          </Link>
          <nav className="header-nav" aria-label={extra.navLabel}>
            <a href="#tentang">{extra.about}</a>
            <a href="#cara-pesan">{t("howLabel")}</a>
            <a href="#lokasi">{extra.location}</a>
            <a href="#kontak">{extra.contact}</a>
          </nav>
          <div className="header-tools">
            <button
              className="nav-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? extra.menuClose : extra.menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? "x" : "menu"} />
            </button>
          </div>
        </div>
        <nav
          id="mobile-nav"
          className={`mobile-nav ${menuOpen ? "is-open" : ""}`}
          aria-label={extra.navLabel}
        >
          <div className="shell mobile-nav-inner">
            <a href="#tentang" onClick={() => setMenuOpen(false)}>{extra.about}</a>
            <a href="#cara-pesan" onClick={() => setMenuOpen(false)}>{t("howLabel")}</a>
            <a href="#lokasi" onClick={() => setMenuOpen(false)}>{extra.location}</a>
            <a href="#kontak" onClick={() => setMenuOpen(false)}>{extra.contact}</a>
            <Link className="btn btn-primary" href="/order?table=3" onClick={() => setMenuOpen(false)}>
              {extra.orderCta}
              <Icon name="arrow-right" />
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        <section className="hero hero-image" aria-labelledby="hero-title">
          <div className="shell hero-inner">
            <div className="hero-copy">
              <p className="hero-kicker">
                <span className="kicker-line" aria-hidden="true" />
                <span>{t("heroKicker")}</span>
              </p>
              <h1 id="hero-title">
                <span>{t("heroTitle1")}</span>
                <span>{t("heroTitle2")}</span>
              </h1>
              <p className="hero-lead">{t("heroLead")}</p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/order?table=3">
                  <Icon name="utensils" />
                  <span>{t("ctaHow")}</span>
                </Link>
                <a className="btn btn-secondary" href={whatsappLink} target="_blank" rel="noreferrer">
                  <Icon name="whatsapp" />
                  <span>{extra.ctaWhatsapp}</span>
                </a>
              </div>
              <ul className="hero-meta">
                <li>
                  <Icon name="clock" />
                  <span>{contactHours}</span>
                </li>
                <li>
                  <Icon name="users" />
                  <span>{t("metaTables")}</span>
                </li>
                <li>
                  <Icon name="wallet" />
                  <span>{t("metaPay")}</span>
                </li>
              </ul>
            </div>

          </div>
        </section>


        <section className="landing-about" id="tentang" aria-labelledby="about-title">
          <div className="shell about-grid">
            <div className="about-head">
              <p className="section-label">{extra.aboutLabel}</p>
              <h2 id="about-title">{extra.aboutTitle}</h2>
            </div>
            <div className="about-carousel">
              <div className="about-image">
                <img src={extra.slides[slide].image} alt={extra.slides[slide].title} />
              </div>
              <div className="about-arrows">
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={() => setSlide((current) => (current + extra.slides.length - 1) % extra.slides.length)}
                >
                  <Icon name="chevron-left" />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={() => setSlide((current) => (current + 1) % extra.slides.length)}
                >
                  <Icon name="chevron-right" />
                </button>
              </div>
            </div>
            <div className="about-copy">
              <p className="about-lead">{extra.aboutLead}</p>
              <div className="about-slide-copy" aria-live="polite">
                <h3>{extra.slides[slide].title}</h3>
                <p>{extra.slides[slide].body}</p>
              </div>
              <div className="about-dots">
                {extra.slides.map((item, index) => (
                  <button
                    type="button"
                    className={index === slide ? "is-active" : ""}
                    key={item.title}
                    aria-label={item.title}
                    onClick={() => setSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-how" id="cara-pesan" aria-labelledby="how-title">
          <div className="shell how-grid">
            <div className="how-intro">
              <p className="section-label how-label">{t("howLabel")}</p>
              <h2 className="how-title" id="how-title">
                <span>{t("howTitle1")}</span>
                <span>{t("howTitle2")}</span>
              </h2>
              <p className="how-lead">{t("howLead")}</p>
              <p className="how-note">
                <Icon name="qr" />
                <span>{t("howNote")}</span>
              </p>
            </div>
            <ol className="how-steps">
              <li className="step">
                <span className="step-num" aria-hidden="true">01</span>
                <div className="step-copy">
                  <h3>{t("step1Title")}</h3>
                  <p>{t("step1Body")}</p>
                </div>
              </li>
              <li className="step">
                <span className="step-num" aria-hidden="true">02</span>
                <div className="step-copy">
                  <h3>{t("step2Title")}</h3>
                  <p>{t("step2Body")}</p>
                </div>
              </li>
              <li className="step">
                <span className="step-num" aria-hidden="true">03</span>
                <div className="step-copy">
                  <h3>{t("step3Title")}</h3>
                  <p>{t("step3Body")}</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="landing-location" id="lokasi" aria-labelledby="location-title">
          <div className="shell landing-location-grid">
            <div className="landing-location-copy">
              <p className="section-label">{extra.locationLabel}</p>
              <h2 id="location-title">{extra.locationTitle}</h2>
              <p className="landing-location-lead">{extra.locationLead}</p>
              <ul className="landing-info">
                <li>
                  <span className="landing-info-icon"><Icon name="pin" /></span>
                  <div><strong>{extra.addressLabel}</strong><span>{contactAddress}</span></div>
                </li>
                <li>
                  <span className="landing-info-icon"><Icon name="clock" /></span>
                  <div><strong>{extra.hoursLabel}</strong><span>{contactHours}</span></div>
                </li>
                <li>
                  <span className="landing-info-icon"><Icon name="whatsapp" /></span>
                  <div><strong>{extra.whatsappLabel}</strong><a href={whatsappLink} target="_blank" rel="noreferrer">{whatsappDisplay}</a></div>
                </li>
              </ul>
              <a className="btn btn-outline btn-sm" href={mapLink} target="_blank" rel="noreferrer">
                <Icon name="pin" />
                <span>{extra.openMap}</span>
              </a>
            </div>
            <div className="landing-map">
              <iframe
                src={mapEmbed}
                title="Kantin Mini location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="landing-contact" id="kontak" aria-labelledby="contact-title">
          <div className="shell">
            <div className="contact-panel">
              <div className="contact-copy">
                <p className="section-label">{extra.contactLabel}</p>
                <h2 id="contact-title">{extra.contactTitle}</h2>
                <p>{extra.contactLead}</p>
                <a className="btn btn-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer">
                  <Icon name="whatsapp" />
                  <span>WhatsApp {whatsappDisplay}</span>
                </a>
                <span className="contact-note">{extra.contactNote}</span>
              </div>
              <div className="contact-side">
                <div className="social-block">
                  <strong>{extra.socialTitle}</strong>
                  <div className="social-row">
                    <a href="https://instagram.com/kantinmini" target="_blank" rel="noreferrer">
                      <Icon name="instagram" /><span>{extra.instagram}</span>
                    </a>
                    <a href="https://tiktok.com/@kantinmini" target="_blank" rel="noreferrer">
                      <Icon name="tiktok" /><span>{extra.tiktok}</span>
                    </a>
                  </div>
                </div>
                <Link className="btn btn-outline" href="/order?table=3">{extra.orderNow}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div className="footer-brand">
            <Link className="brand brand-footer" href="/" aria-label="Kantin Mini">
              <span className="brand-mark"><Icon name="logo-mark" className="logo" /></span>
              <span className="brand-word">Kantin <em>Mini</em></span>
            </Link>
            <p>{t("footerTagline")}</p>
          </div>
          <nav className="footer-nav" aria-label={t("footerNavLabel")}>
            <a href="#tentang">{extra.footerAbout}</a>
            <a href="#cara-pesan">{t("footerNavHow")}</a>
            <a href="#lokasi">{t("footerNavLocation")}</a>
            <a href="#kontak">{extra.footerContact}</a>
            <Link href="/login">{t("footerNavStaff")}</Link>
          </nav>
          <div className="footer-info">
            <p><Icon name="pin" /><span>{contactAddress}</span></p>
            <p><Icon name="clock" /><span>{contactHours}</span></p>
          </div>
        </div>
        <div className="shell footer-bottom">
          <p>© 2026 Kantin Mini.</p>
          <p>{t("footerNote")}</p>
          <LanguageSwitch dark />
        </div>
      </footer>
    </>
  );
}
