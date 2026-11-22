"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { api } from "@/lib/api-client";
import type { PublicSettings } from "@/lib/api-types";
import { useLanguage } from "@/lib/i18n";

export default function LandingPage() {
  const { t, lang } = useLanguage();
  const [slide, setSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [site, setSite] = useState<PublicSettings | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [loadMap, setLoadMap] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

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
          aboutTitle: "Resep Rumahan, Rasa Juara.",
          aboutLead:
            "Berawal dari resep keluarga yang dicintai, Kantin Mini hadir di Bandung untuk menyajikan masakan harian dengan cita rasa Nusantara yang jujur dan apa adanya. Di sini, kami percaya makanan enak tidak harus mahal, yang penting bersih, porsinya pas, dan disajikan dengan senyuman hangat.",
          aboutPhotos: [
            { image: "/assets/about/about-1.webp", alt: "Suasana ruang makan Kantin Mini" },
            { image: "/assets/about/about-2.webp", alt: "Area penyajian Kantin Mini" },
            { image: "/assets/about/about-3.webp", alt: "Suasana hangat Kantin Mini" },
          ],
          highlights: [
            {
              icon: "utensils" as const,
              title: "Banyak Pilihan Menu",
              body: "Mulai dari Katsu, Pempek Palembang asli, mie/pasta, sampai aneka minuman segar biar tidak bosan makan itu-itu saja.",
            },
            {
              icon: "wallet" as const,
              title: "Ramah di Kantong",
              body: "Sajian berkualitas porsi kenyang dengan harga mahasiswa dan anak kos. Makan enak tidak perlu menunggu tanggal muda!",
            },
            {
              icon: "chef-hat" as const,
              title: "Dibuat saat dipesan",
              body: "Pesananmu diolah dan disajikan dengan cepat agar tidak perlu menunggu lama saat lapar melanda.",
            },
          ],
          locationLabel: "Lokasi",
          locationTitle: "Mampir ke Kantin Mini",
          locationLead:
            "Yuk mampir! Kami siap menyambut Anda",
          addressLabel: "Alamat",
          address: "Gang Melong Kaler I no. 1",
          hoursLabel: "Jam operasional",
          hours: "Senin–Jumat, 08.00–19.00",
          whatsappLabel: "WhatsApp",
          openMap: "Buka di Google Maps",
          contactLabel: "Kontak",
          contactTitle: "Ada pertanyaan? Chat kami.",
          contactLead:
            "Untuk pertanyaan menu, pesanan, atau kerja sama, WhatsApp adalah jalur tercepat. Kami balas pada jam operasional.",
          contactNote: "Balasan pada Senin–Jumat, 08.00–19.00.",
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
          aboutTitle: "Home-Style Recipes, Champion Flavor.",
          aboutLead:
            "Rooted in beloved family recipes, Kantin Mini is here in Bandung to serve daily comfort meals with honest, authentic Indonesian flavors. We believe good food doesn't have to be expensive—what matters is that it's clean, generously portioned, and served with a warm smile.",
          aboutPhotos: [
            { image: "/assets/about/about-1.webp", alt: "Kantin Mini dining area" },
            { image: "/assets/about/about-2.webp", alt: "Kantin Mini serving counter" },
            { image: "/assets/about/about-3.webp", alt: "Warm atmosphere at Kantin Mini" },
          ],
          highlights: [
            {
              icon: "utensils" as const,
              title: "Wide Menu Selection",
              body: "From Katsu, authentic Palembang Pempek, noodles & pasta, to refreshing drinks so you'll never get bored.",
            },
            {
              icon: "wallet" as const,
              title: "Pocket-Friendly",
              body: "Quality, satisfying meals at student and boarding-friendly prices. Delicious food doesn't have to wait until payday!",
            },
            {
              icon: "chef-hat" as const,
              title: "Made Fresh to Order",
              body: "Your food is prepared and served quickly so you don't have to wait long when hunger strikes.",
            },
          ],
          locationLabel: "Location",
          locationTitle: "Visit Kantin Mini",
          locationLead:
            "Come drop by! We're ready to welcome you.",
          addressLabel: "Address",
          address: "Gang Melong Kaler I no. 1",
          hoursLabel: "Opening hours",
          hours: "Mon–Fri, 08.00–19.00",
          whatsappLabel: "WhatsApp",
          openMap: "Open in Google Maps",
          contactLabel: "Contact",
          contactTitle: "Questions? Chat with us.",
          contactLead:
            "WhatsApp is the fastest way to ask about the menu, an order, or a partnership. We reply during opening hours.",
          contactNote: "Replies Mon–Fri, 08.00–19.00.",
          socialTitle: "Follow the canteen",
          instagram: "Instagram",
          tiktok: "TikTok",
          orderNow: "Order now",
          footerAbout: "About",
          footerContact: "Contact",
        };

  const isWhatsappMode = site?.orderMode !== "cashier";
  const whatsappNumber = (site?.whatsappNumber || "6285117693117").replace(/\D/g, "").replace(/^0/, "62");
  const whatsappLocal = whatsappNumber.startsWith("62") ? `0${whatsappNumber.slice(2)}` : whatsappNumber;
  const whatsappDisplay = whatsappLocal.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  const defaultContactText =
    lang === "id"
      ? "Halo Kantin Mini, saya ingin bertanya tentang menu atau pesanan."
      : "Hi Kantin Mini, I would like to ask about the menu or an order.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultContactText)}`;
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
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const hero = document.querySelector<HTMLElement>(".hero");
      setPastHero(window.scrollY > (hero ? hero.offsetHeight : 600));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const photoCount = extra.aboutPhotos.length;
  useEffect(() => {
    if (carouselPaused) return;
    const timer = window.setTimeout(() => {
      setSlide((current) => (current + 1) % photoCount);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [slide, carouselPaused, photoCount]);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/assets/hero/hero-kantin-sm.webp"
        media="(max-width: 640px)"
      />
      <link
        rel="preload"
        as="image"
        href="/assets/hero/hero-kantin-lg.webp"
        media="(min-width: 641px)"
      />
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
            <Link className="btn btn-primary" href="/order" onClick={() => setMenuOpen(false)}>
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
                <Link className="btn btn-primary hero-order-cta" href="/order" prefetch>
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
                  <Icon name="pin" />
                  <span>{t("locAddress")}</span>
                </li>
                {/* <li>
                  <Icon name="wallet" />
                  <span>{t("metaPay")}</span>
                </li> */}
              </ul>
            </div>

          </div>
        </section>


        <section className="landing-about" id="tentang" aria-labelledby="about-title">
          <div className="shell">
            <div className="about-grid">
              <div className="about-head">
                <p className="section-label">{extra.aboutLabel}</p>
                <h2 id="about-title">{extra.aboutTitle}</h2>
              </div>
              <div
                className="about-carousel"
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
                onFocus={() => setCarouselPaused(true)}
                onBlur={() => setCarouselPaused(false)}
              >
                <div className="about-image">
                  {extra.aboutPhotos.map((photo, index) => (
                    <img
                      key={photo.image}
                      src={photo.image}
                      alt={photo.alt}
                      className={index === slide ? "is-active" : ""}
                      width={800}
                      height={600}
                      loading={index === 0 ? "lazy" : "lazy"}
                      decoding="async"
                    />
                  ))}
                </div>
                <button
                  className="about-arrow about-arrow-prev"
                  type="button"
                  aria-label={lang === "id" ? "Foto sebelumnya" : "Previous photo"}
                  onClick={() => setSlide((current) => (current + photoCount - 1) % photoCount)}
                >
                  <Icon name="chevron-left" />
                </button>
                <button
                  className="about-arrow about-arrow-next"
                  type="button"
                  aria-label={lang === "id" ? "Foto berikutnya" : "Next photo"}
                  onClick={() => setSlide((current) => (current + 1) % photoCount)}
                >
                  <Icon name="chevron-right" />
                </button>
                <div className="about-dots" role="tablist" aria-label={lang === "id" ? "Pilih foto suasana kantin" : "Select canteen photo"}>
                  {extra.aboutPhotos.map((photo, index) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={index === slide}
                      className={index === slide ? "is-active" : ""}
                      key={photo.image}
                      aria-label={photo.alt}
                      onClick={() => setSlide(index)}
                    />
                  ))}
                </div>
              </div>
              <div className="about-copy">
                <p className="about-lead">{extra.aboutLead}</p>
              </div>
            </div>

            <div className="about-highlights">
              {extra.highlights.map((item) => (
                <article className="about-highlight" key={item.title}>
                  <span className="about-highlight-icon" aria-hidden="true">
                    <Icon name={item.icon} />
                  </span>
                  <div className="about-highlight-copy">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-how" id="cara-pesan" aria-labelledby="how-title">
          <div className="shell how-grid">
            <div className="how-intro">
              <p className="section-label how-label">{t("howLabel")}</p>
              <h2 className="how-title" id="how-title">
                <span>{t(isWhatsappMode ? "howWaTitle1" : "howTitle1")}</span>
                <span>{t(isWhatsappMode ? "howWaTitle2" : "howTitle2")}</span>
              </h2>
              <p className="how-lead">{t(isWhatsappMode ? "howWaLead" : "howLead")}</p>
              <p className="how-note">
                <Icon name={isWhatsappMode ? "whatsapp" : "qr"} />
                <span>{t(isWhatsappMode ? "howWaNote" : "howNote")}</span>
              </p>
            </div>
            <ol className="how-steps">
              <li className="step">
                <span className="step-num" aria-hidden="true">01</span>
                <div className="step-copy">
                  <h3>{t(isWhatsappMode ? "stepWa1Title" : "step1Title")}</h3>
                  <p>{t(isWhatsappMode ? "stepWa1Body" : "step1Body")}</p>
                </div>
              </li>
              <li className="step">
                <span className="step-num" aria-hidden="true">02</span>
                <div className="step-copy">
                  <h3>{t(isWhatsappMode ? "stepWa2Title" : "step2Title")}</h3>
                  <p>{t(isWhatsappMode ? "stepWa2Body" : "step2Body")}</p>
                </div>
              </li>
              <li className="step">
                <span className="step-num" aria-hidden="true">03</span>
                <div className="step-copy">
                  <h3>{t(isWhatsappMode ? "stepWa3Title" : "step3Title")}</h3>
                  <p>{t(isWhatsappMode ? "stepWa3Body" : "step3Body")}</p>
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
            <div className="landing-map" ref={mapRef}>
              {loadMap ? (
                <iframe
                  src={mapEmbed}
                  title="Kantin Mini location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : null}
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
                {/* <span className="contact-note">{extra.contactNote}</span> */}
              </div>
              <div className="contact-side">
                <div className="social-block">
                  <strong>{extra.socialTitle}</strong>
                  <div className="social-row">
                    <a href="https://instagram.com/kantinmini.id" target="_blank" rel="noreferrer">
                      <Icon name="instagram" /><span>{extra.instagram}</span>
                    </a>
                    <a href="https://tiktok.com/@kantinmini.id" target="_blank" rel="noreferrer">
                      <Icon name="tiktok" /><span>{extra.tiktok}</span>
                    </a>
                  </div>
                </div>
                
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
          </nav>
          <div className="footer-info">
            <p><Icon name="pin" /><span>{contactAddress}</span></p>
            <p><Icon name="clock" /><span>{contactHours}</span></p>
          </div>
        </div>
        <div className="shell footer-bottom">
          <p>© 2026 Kantin Mini.</p>
          <p>{t("footerNote")}</p>
          {/* <LanguageSwitch dark /> */}
        </div>
      </footer>

      <Link className={`landing-order-fab ${pastHero ? "is-visible" : ""}`} href="/order">
        <Icon name="utensils" />
        <span>{t("ctaHow")}</span>
      </Link>
    </>
  );
}
