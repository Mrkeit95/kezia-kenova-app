"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import ProductModal from "@/components/ProductModal";
import InfoModal from "@/components/InfoModal";
import VideoModal from "@/components/VideoModal";
import "./globals.css";
import "./home.css";

const DEFAULTS = {
  location: "Bali · Indonesia",
  tagline: "model · creator · storyteller",
  instagram_url: "https://www.instagram.com/keziaken/",
  tiktok_url: "https://www.tiktok.com/@keziaken",
  whatsapp_url: "",
  email: "keziakenwork@gmail.com",
  hero_image: "/kezia.jpeg",
  hero_images: [],
  about_text: "",
  brand_images: [],
  local_brand_images: [],
};

const TERMS_CONTENT = [
  { h: "Welcome", p: "By using keziakenova.com you agree to these terms. If you don't agree, please don't use the site." },
  { h: "Affiliate links", p: "Many product links here are affiliate. If you click through and buy, I may earn a small commission, at no cost to you. I only recommend products I genuinely use or love." },
  { h: "External sites", p: "Clicking an affiliate or social link takes you to a third-party site. I'm not responsible for their content or privacy practices." },
  { h: "Content", p: "All original photos, words, and design here belong to Kezia Ken. Please don't reproduce without asking." },
  { h: "Contact", p: "Questions? Email keziakenwork@gmail.com." },
];

const PRIVACY_CONTENT = [
  { h: "What I collect", p: "Only what you give me directly: your email if you subscribe, and anonymous click data (so I can see what's popular)." },
  { h: "What I don't collect", p: "No third-party tracking, no advertising cookies, no selling your data. Ever." },
  { h: "How I use your email", p: "Only to send you my newsletter. Stored securely. You can unsubscribe anytime." },
  { h: "Third parties", p: "Affiliate links take you to other retailers. They have their own privacy policies." },
  { h: "Your rights", p: "You can ask me to delete your email at any time — just email keziakenwork@gmail.com." },
  { h: "Children", p: "This site isn't directed at children under 13, and I don't knowingly collect their data." },
];

// Lightbox modal for image galleries
function GalleryModal({ title, images, open, onClose }) {
  const [active, setActive] = useState(0);

  useEffect(() => { if (open) setActive(0); }, [open]);

  const prev = useCallback(() => setActive((a) => (a - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((a) => (a + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next, onClose]);

  if (!open || !images.length) return null;

  return (
    <div className="gallery-overlay" onClick={onClose}>
      <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="gallery-header">
          <span className="gallery-title">{title}</span>
          <span className="gallery-count">{active + 1} / {images.length}</span>
          <button className="gallery-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main image */}
        <div className="gallery-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[active]} alt={`${title} ${active + 1}`} className="gallery-img" />

          {images.length > 1 && (
            <>
              <button className="gallery-nav gallery-nav-prev" onClick={prev} aria-label="Previous">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button className="gallery-nav gallery-nav-next" onClick={next} aria-label="Next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="gallery-thumbs">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`gallery-thumb ${i === active ? "active" : ""}`}
                aria-label={`Image ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage({ products, settings, looks, sections, videos, layout }) {
  const s = { ...DEFAULTS, ...settings };
  const list = products;

  const [modalProduct, setModalProduct] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showBrands, setShowBrands] = useState(false);
  const [showLocalBrands, setShowLocalBrands] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("home_scroll");
    if (savedScroll) {
      sessionStorage.removeItem("home_scroll");
      setTimeout(() => window.scrollTo({ top: parseInt(savedScroll), behavior: "instant" }), 50);
    }
  }, []);

  const saveScrollForCategory = () => sessionStorage.setItem("home_scroll", String(window.scrollY));

  useEffect(() => {
    const anyOpen = modalProduct || showTerms || showPrivacy || showAbout || showBrands || showLocalBrands || activeVideo;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalProduct, showTerms, showPrivacy, showAbout, showBrands, showLocalBrands, activeVideo]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("revealed"); observer.unobserve(entry.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const productMap = list.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
  const heroImages = (s.hero_images && s.hero_images.length > 0) ? s.hero_images : [s.hero_image];

  const visibleSections = (sections || []).filter((sec) =>
    (sec.product_ids || []).some((id) => productMap[id])
  );

  const hasAbout = s.about_text && s.about_text.trim().length > 0;
  const hasBrands = s.brand_images && s.brand_images.length > 0;
  const hasLocalBrands = s.local_brand_images && s.local_brand_images.length > 0;
  const hasLooks = looks && looks.length > 0;
  const tiktokVideos = (videos || []).filter((v) => v.platform === "tiktok");
  const instagramVideos = (videos || []).filter((v) => v.platform === "instagram");
  const hasTikTok = tiktokVideos.length > 0;
  const hasInstagram = instagramVideos.length > 0;
  const showTabs = hasAbout || hasBrands || hasLocalBrands || hasTikTok || hasInstagram || hasLooks || visibleSections.length > 0;

  // Build ordered list of section block IDs
  const defaultOrder = [
    ...(hasAbout ? ["about"] : []),
    ...(hasBrands ? ["brands"] : []),
    ...(hasLocalBrands ? ["local_brands"] : []),
    ...(hasLooks ? ["looks"] : []),
    ...visibleSections.map((sec) => `section_${sec.slug}`),
    ...(hasTikTok ? ["tiktok"] : []),
    ...(hasInstagram ? ["instagram"] : []),
  ];

  const activeLayout = layout
    ? layout.filter((id) => defaultOrder.includes(id))
    : defaultOrder;
  // append any new blocks not yet in saved layout
  const finalOrder = [
    ...activeLayout,
    ...defaultOrder.filter((id) => !activeLayout.includes(id)),
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>

        <div className="page-blur-bg" aria-hidden="true">
          {heroImages[0] && <img src={heroImages[0]} alt="" />}
        </div>

        <div className="shell">
          <div className="hero">
            <HeroCarousel images={heroImages} fallback={s.hero_image} />
          </div>

          <header className="header">
            <div className="eyebrow">
              <span className="dot"></span>
              <span>{s.location}</span>
            </div>
            <h1 className="name">Kezia Ken</h1>
            <p className="tagline">{s.tagline}</p>
          </header>

          {/* Social icons */}
          <nav className="social-icons">
            {s.instagram_url && (
              <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
              </a>
            )}
            {s.tiktok_url && (
              <a href={s.tiktok_url} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            )}
            {s.whatsapp_url && (
              <a href={s.whatsapp_url} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            )}
            {s.email && (
              <a href={`mailto:${s.email}`} className="social-icon" aria-label="Email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
                </svg>
              </a>
            )}
          </nav>

          {/* Tab bar — About + Brand tabs open modals, section tabs scroll */}
          {showTabs && (
            <div className="section-tabs-wrap">
              <div className="section-tabs">
                {hasAbout && (
                  <button className="section-tab" onClick={() => setShowAbout(true)}>About Me</button>
                )}
                {hasBrands && (
                  <button className="section-tab" onClick={() => setShowBrands(true)}>High End Brands</button>
                )}
                {hasLocalBrands && (
                  <button className="section-tab" onClick={() => setShowLocalBrands(true)}>Local Brands</button>
                )}
                {hasTikTok && (
                  <button className="section-tab" onClick={() => scrollToSection("tiktok")}>TikTok</button>
                )}
                {hasInstagram && (
                  <button className="section-tab" onClick={() => scrollToSection("instagram")}>Instagram</button>
                )}
                {hasLooks && (
                  <button className="section-tab" onClick={() => scrollToSection("looks")}>Get the Look</button>
                )}
                {visibleSections.map((sec) => (
                  <button key={sec.id} className="section-tab" onClick={() => scrollToSection(`section-${sec.slug}`)}>
                    {sec.title}
                  </button>
                ))}
              </div>
            </div>
          )}

                    {/* All sections rendered in layout order */}
          {finalOrder.map((blockId, idx) => {

            if (blockId === "tiktok" && hasTikTok) return (
              <section key="tiktok" id="tiktok" className="section reveal reveal-up">
                <div className="section-head"><div className="line"></div><h2 className="section-title">TikTok</h2><div className="line"></div></div>
                <p className="section-sub">watch · shop the yellow card</p>
                <div className="video-cards-wrap"><div className="video-cards">
                  {tiktokVideos.map((v) => (
                    <button key={v.id} className="video-card" onClick={() => setActiveVideo(v)}>
                      <div className="video-card-thumb">
                        {v.thumbnail_url && <img src={v.thumbnail_url} alt={v.caption || "TikTok"} className="video-card-thumb-img" />}
                        <div className="video-card-platform tiktok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></div>
                        <div className="video-card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
                        <div className="video-card-body">
                          <p className="video-card-caption">{v.caption || ""}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div></div>
              </section>
            );

            if (blockId === "instagram" && hasInstagram) return (
              <section key="instagram" id="instagram" className="section reveal reveal-up">
                <div className="section-head"><div className="line"></div><h2 className="section-title">Instagram</h2><div className="line"></div></div>
                <p className="section-sub">reels &amp; moments</p>
                <div className="video-cards-wrap"><div className="video-cards">
                  {instagramVideos.map((v) => (
                    <button key={v.id} className="video-card" onClick={() => setActiveVideo(v)}>
                      <div className="video-card-thumb">
                        {v.thumbnail_url && <img src={v.thumbnail_url} alt={v.caption || "Instagram"} className="video-card-thumb-img" />}
                        <div className="video-card-platform instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg></div>
                        <div className="video-card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
                        <div className="video-card-body">
                          <p className="video-card-caption">{v.caption || ""}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div></div>
              </section>
            );

            if (blockId === "looks" && hasLooks) return (
              <section key="looks" id="looks" className="section reveal reveal-left">
                <div className="section-head"><div className="line"></div><h2 className="section-title">Get the Look</h2><div className="line"></div></div>
                <p className="section-sub">full outfits, head to toe</p>
                <div className="looks-grid">
                  {looks.slice(0, 4).map((look) => (
                    <Link key={look.id} href={`/looks/${look.id}`} className="look-card">
                      <div className="look-img">{look.cover_image && <img src={look.cover_image} alt={look.title} loading="lazy" />}</div>
                      <div className="look-body"><div className="look-title">{look.title}</div><div className="look-shop">Shop the look ›</div></div>
                    </Link>
                  ))}
                </div>
                {looks.length > 4 && <div className="view-all-wrap"><Link href="/looks" className="view-all">View all looks ›</Link></div>}
              </section>
            );

            if (blockId.startsWith("section_")) {
              const slug = blockId.replace("section_", "");
              const sec = visibleSections.find((s) => s.slug === slug);
              if (!sec) return null;
              const sectionProducts = (sec.product_ids || []).map((id) => productMap[id]).filter(Boolean).slice(0, 8);
              if (!sectionProducts.length) return null;
              return (
                <section key={sec.id} id={`section-${sec.slug}`} className="section reveal reveal-up">
                  <div className="section-head"><div className="line"></div><h2 className="section-title">{sec.title}</h2><div className="line"></div></div>
                  {sec.subtitle && <p className="section-sub">{sec.subtitle}</p>}
                  <ProductCarousel products={sectionProducts} onProductClick={setModalProduct} />
                  <div className="view-all-wrap">
                    <Link href={`/category/${sec.slug}`} onClick={saveScrollForCategory} className="view-all">
                      View all {(sec.product_ids || []).length} {sec.title.toLowerCase()} ›
                    </Link>
                  </div>
                </section>
              );
            }

            return null;
          })}

          <footer className="footer reveal reveal-up">
            <div className="rule"></div>

            {/* Social icons in footer */}
            {(s.instagram_url || s.tiktok_url || s.whatsapp_url || s.email) && (
              <div className="footer-social">
                {s.instagram_url && (
                  <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                    </svg>
                    <span>Instagram</span>
                  </a>
                )}
                {s.tiktok_url && (
                  <a href={s.tiktok_url} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="TikTok">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                    <span>TikTok</span>
                  </a>
                )}
                {s.whatsapp_url && (
                  <a href={s.whatsapp_url} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="WhatsApp">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                )}
                {s.email && (
                  <a href={`mailto:${s.email}`} className="footer-social-link" aria-label="Email">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
                    </svg>
                    <span>Email</span>
                  </a>
                )}
              </div>
            )}

            <div className="footer-links">
              <button onClick={() => setShowTerms(true)} className="footer-link-btn">Terms</button>
              <span className="footer-dot">·</span>
              <button onClick={() => setShowPrivacy(true)} className="footer-link-btn">Privacy</button>
            </div>
            <p>© {new Date().getFullYear()} Kezia Ken</p>
            <p className="disclaimer">Some links are affiliate — I may earn a small commission, at no cost to you.</p>
          </footer>
        </div>
      </main>

      {/* Product modal */}
      {modalProduct && <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />}

      {/* Video modal */}
      {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}

      {/* About Me modal */}
      <InfoModal open={showAbout} onClose={() => setShowAbout(false)} subtitle={s.tagline} title="About Me">
        <div className="about-modal-body">
          {s.about_text.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
        </div>
      </InfoModal>

      {/* Brand Work lightbox */}
      <GalleryModal title="High End Brands" images={s.brand_images} open={showBrands} onClose={() => setShowBrands(false)} />

      {/* Local Brands lightbox */}
      <GalleryModal title="Local Brands" images={s.local_brand_images} open={showLocalBrands} onClose={() => setShowLocalBrands(false)} />

      {/* Terms */}
      <InfoModal open={showTerms} onClose={() => setShowTerms(false)} subtitle="Last updated" title="Terms of Service">
        <div className="legal-modal-content">
          {TERMS_CONTENT.map((s, i) => <section key={i}><h3>{s.h}</h3><p>{s.p}</p></section>)}
        </div>
      </InfoModal>

      {/* Privacy */}
      <InfoModal open={showPrivacy} onClose={() => setShowPrivacy(false)} subtitle="Last updated" title="Privacy Policy">
        <div className="legal-modal-content">
          {PRIVACY_CONTENT.map((s, i) => <section key={i}><h3>{s.h}</h3><p>{s.p}</p></section>)}
        </div>
      </InfoModal>
    </>
  );
}
