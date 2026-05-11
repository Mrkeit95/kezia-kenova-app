"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import ProductModal from "@/components/ProductModal";
import InfoModal from "@/components/InfoModal";
import "./globals.css";
import "./home.css";

const DEFAULTS = {
  location: "Bali · Indonesia",
  tagline: "model · creator · storyteller",
  instagram_url: "https://www.instagram.com/keziaken/",
  tiktok_url: "https://www.tiktok.com/@keziaken",
  email: "keziakenwork@gmail.com",
  hero_image: "/kezia.jpeg",
  hero_images: [],
};

const FALLBACK_PRODUCTS = [
  { id: "f1", category: "Jewellery", title: "Gold Chain Necklace", brand: "Mejuri", price: "Rp 1.800.000", featured: true, image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80", affiliate_url: "#", description: "A delicate gold-filled chain that goes with everything." },
  { id: "f2", category: "Jewellery", title: "Pearl Drop Earrings", brand: "Missoma", price: "Rp 1.450.000", featured: false, image_url: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80", affiliate_url: "#", description: "Freshwater pearls on gold hooks." },
  { id: "f3", category: "Jewellery", title: "Stacking Rings Set", brand: "Catbird", price: "Rp 2.700.000", featured: true, image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80", affiliate_url: "#", description: "Three thin bands designed to stack." },
  { id: "f4", category: "Jewellery", title: "Tennis Bracelet", brand: "Monica Vinader", price: "Rp 3.600.000", featured: false, image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80", affiliate_url: "#", description: "A modern, refined take on the classic." },
  { id: "f5", category: "Makeup", title: "Signature Nude Lip", brand: "Charlotte Tilbury", price: "Rp 570.000", featured: true, image_url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80", affiliate_url: "#", description: "My go-to neutral lip." },
  { id: "f6", category: "Makeup", title: "Skin Tint Foundation", brand: "Rare Beauty", price: "Rp 480.000", featured: false, image_url: "https://images.unsplash.com/photo-1631214540242-3cd8c4b0b3b8?w=600&q=80", affiliate_url: "#", description: "Lightweight, buildable, never cakey." },
  { id: "f7", category: "Makeup", title: "Liquid Highlighter", brand: "Fenty Beauty", price: "Rp 540.000", featured: false, image_url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&q=80", affiliate_url: "#", description: "Lit-from-within glow, no glitter." },
  { id: "f8", category: "Makeup", title: "Cream Blush Stick", brand: "Westman Atelier", price: "Rp 720.000", featured: false, image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80", affiliate_url: "#", description: "Buildable cream that melts into skin." },
  { id: "f9", category: "Fashion", title: "Oversized Blazer", brand: "Reformation", price: "Rp 4.470.000", featured: true, image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80", affiliate_url: "#", description: "The blazer I reach for endlessly." },
  { id: "f10", category: "Fashion", title: "Silk Slip Dress", brand: "Réalisation Par", price: "Rp 3.300.000", featured: false, image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80", affiliate_url: "#", description: "Silk satin that drapes beautifully." },
  { id: "f11", category: "Fashion", title: "Leather Tote Bag", brand: "Polène", price: "Rp 7.800.000", featured: false, image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80", affiliate_url: "#", description: "Structured, polished, holds everything." },
  { id: "f12", category: "Fashion", title: "Strappy Sandals", brand: "The Row", price: "Rp 13.350.000", featured: false, image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80", affiliate_url: "#", description: "Minimal, surprisingly walkable." },
  { id: "f13", category: "Skincare", title: "Vitamin C Serum", brand: "Drunk Elephant", price: "Rp 1.200.000", featured: false, image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", affiliate_url: "#", description: "Brightens and evens skin tone." },
  { id: "f14", category: "Skincare", title: "Hydrating Cream", brand: "Augustinus Bader", price: "Rp 2.775.000", featured: true, image_url: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=600&q=80", affiliate_url: "#", description: "Plumps, smooths, and softens skin." },
  { id: "f15", category: "Skincare", title: "Daily SPF 50", brand: "Supergoop", price: "Rp 570.000", featured: false, image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80", affiliate_url: "#", description: "Invisible, no white cast, non-negotiable in Bali." },
  { id: "f16", category: "Skincare", title: "Gentle Cleanser", brand: "Tatcha", price: "Rp 720.000", featured: false, image_url: "https://images.unsplash.com/photo-1620916297893-9d33ed5b3683?w=600&q=80", affiliate_url: "#", description: "Rice-based, never strips skin." },
];

const SECTION_SUBS = {
  Jewellery: "the pieces I never take off",
  Makeup: "my five-minute face",
  Fashion: "what I actually wear",
  Skincare: "the routine that keeps my skin glowing",
};

const TERMS_CONTENT = [
  { h: "Welcome", p: "By using keziakenova.com you agree to these terms. If you don't agree, please don't use the site." },
  { h: "Affiliate links", p: "Many product links here are affiliate. If you click through and buy, I may earn a small commission, at no cost to you. I only recommend products I genuinely use or love." },
  { h: "External sites", p: "Clicking an affiliate or social link takes you to a third-party site. I'm not responsible for their content or privacy practices." },
  { h: "Content", p: "All original photos, words, and design here belong to Kezia Kenova. Please don't reproduce without asking." },
  { h: "Newsletter", p: "By subscribing, you agree to receive occasional emails. Unsubscribe any time." },
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

export default function HomePage({ products, settings, looks, journalPosts }) {
  const s = { ...DEFAULTS, ...settings };
  const list = products.length > 0 ? products : FALLBACK_PRODUCTS;

  const [modalProduct, setModalProduct] = useState(null);
  const [modalJournal, setModalJournal] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Restore scroll position when returning from a category page
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("home_scroll");
    if (savedScroll) {
      sessionStorage.removeItem("home_scroll");
      // Wait for content to render then scroll
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll), behavior: "instant" });
      }, 50);
    }
  }, []);

  // Save scroll before navigating away to category pages
  const saveScrollForCategory = () => {
    sessionStorage.setItem("home_scroll", String(window.scrollY));
  };

  // Lock scroll when any modal is open
  useEffect(() => {
    const anyOpen = modalProduct || modalJournal || showTerms || showPrivacy;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalProduct, modalJournal, showTerms, showPrivacy]);

  // Scroll-reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const bestSellers = list.filter((p) => p.featured);

  const grouped = list.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const order = ["Jewellery", "Makeup", "Fashion", "Skincare"];
  const sections = [
    ...order.filter((cat) => grouped[cat]),
    ...Object.keys(grouped).filter((cat) => !order.includes(cat)),
  ];

  const instagramHandle = s.instagram_url ? `@${s.instagram_url.split("/").filter(Boolean).pop()}` : "@keziaken";
  const tiktokHandle = s.tiktok_url ? `@${s.tiktok_url.split("@").pop().replace(/\/$/, "")}` : "@keziaken";

  // Hero images: use array if present, fallback to single image
  const heroImages = (s.hero_images && s.hero_images.length > 0) ? s.hero_images : [s.hero_image];

  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="shell">
          <div className="hero">
            <HeroCarousel images={heroImages} fallback={s.hero_image} />
          </div>

          <header className="header">
            <div className="eyebrow">
              <span className="dot"></span>
              <span>{s.location}</span>
            </div>
            <h1 className="name">Kezia Kenova</h1>
            <p className="tagline">{s.tagline}</p>
          </header>

          <nav className="links">
            {s.instagram_url && (
              <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="link">
                <span className="link-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                  </svg>
                </span>
                <span className="link-text">
                  <span className="link-label">Instagram</span>
                  <span className="link-handle">{instagramHandle}</span>
                </span>
                <ArrowIcon />
              </a>
            )}

            {s.tiktok_url && (
              <a href={s.tiktok_url} target="_blank" rel="noopener noreferrer" className="link">
                <span className="link-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </span>
                <span className="link-text">
                  <span className="link-label">TikTok</span>
                  <span className="link-handle">{tiktokHandle}</span>
                </span>
                <ArrowIcon />
              </a>
            )}

            {s.email && (
              <a href={`mailto:${s.email}`} className="link">
                <span className="link-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>
                <span className="link-text">
                  <span className="link-label">Email</span>
                  <span className="link-handle">Bookings & inquiries</span>
                </span>
                <ArrowIcon />
              </a>
            )}
          </nav>

          {bestSellers.length > 0 && (
            <section id="best-sellers" className="section reveal reveal-up">
              <div className="section-head">
                <div className="line"></div>
                <h2 className="section-title">Best Sellers</h2>
                <div className="line"></div>
              </div>
              <p className="section-sub">the ones you keep asking me about</p>
              <ProductCarousel products={bestSellers} onProductClick={setModalProduct} />
            </section>
          )}

          {looks && looks.length > 0 && (
            <section id="looks" className="section reveal reveal-left">
              <div className="section-head">
                <div className="line"></div>
                <h2 className="section-title">Get the Look</h2>
                <div className="line"></div>
              </div>
              <p className="section-sub">full outfits, head to toe</p>
              <div className="looks-grid">
                {looks.slice(0, 4).map((look) => (
                  <Link key={look.id} href={`/looks/${look.id}`} className="look-card">
                    <div className="look-img">
                      {look.cover_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={look.cover_image} alt={look.title} loading="lazy" />
                      )}
                    </div>
                    <div className="look-body">
                      <div className="look-title">{look.title}</div>
                      <div className="look-shop">Shop the look ›</div>
                    </div>
                  </Link>
                ))}
              </div>
              {looks.length > 4 && (
                <div className="view-all-wrap">
                  <Link href="/looks" className="view-all">View all looks ›</Link>
                </div>
              )}
            </section>
          )}

          {sections.map((cat, idx) => {
            const preview = grouped[cat].slice(0, 8);
            const revealClass = idx % 2 === 0 ? "reveal-up" : "reveal-right";
            return (
              <section
                key={cat}
                id={`category-${cat.toLowerCase()}`}
                className={`section reveal ${revealClass}`}
              >
                <div className="section-head">
                  <div className="line"></div>
                  <h2 className="section-title">{cat}</h2>
                  <div className="line"></div>
                </div>
                {SECTION_SUBS[cat] && <p className="section-sub">{SECTION_SUBS[cat]}</p>}
                <ProductCarousel products={preview} onProductClick={setModalProduct} />
                <div className="view-all-wrap">
                  <Link
                    href={`/category/${cat.toLowerCase()}`}
                    onClick={saveScrollForCategory}
                    className="view-all"
                  >
                    View all {grouped[cat].length} {cat.toLowerCase()} ›
                  </Link>
                </div>
              </section>
            );
          })}

          {journalPosts && journalPosts.length > 0 && (
            <section id="journal" className="section reveal reveal-up">
              <div className="section-head">
                <div className="line"></div>
                <h2 className="section-title">Journal</h2>
                <div className="line"></div>
              </div>
              <p className="section-sub">stories, thoughts, places I've been</p>
              <div className="journal-list">
                {journalPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setModalJournal(post)}
                    className="journal-card"
                  >
                    {post.cover_image && (
                      <div className="journal-img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.cover_image} alt={post.title} loading="lazy" />
                      </div>
                    )}
                    <div className="journal-body">
                      <div className="journal-date">
                        {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </div>
                      <h3 className="journal-title">{post.title}</h3>
                      {post.excerpt && <p className="journal-excerpt">{post.excerpt}</p>}
                      <span className="journal-read">Read more ›</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <NewsletterForm />

          <footer className="footer reveal reveal-up">
            <div className="rule"></div>
            <div className="footer-links">
              <button onClick={() => setShowTerms(true)} className="footer-link-btn">Terms</button>
              <span className="footer-dot">·</span>
              <button onClick={() => setShowPrivacy(true)} className="footer-link-btn">Privacy</button>
            </div>
            <p>© {new Date().getFullYear()} Kezia Kenova</p>
            <p className="disclaimer">
              Some links are affiliate — I may earn a small commission, at no cost to you.
            </p>
          </footer>
        </div>
      </main>

      {modalProduct && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
      )}

      <InfoModal
        open={!!modalJournal}
        onClose={() => setModalJournal(null)}
        subtitle={modalJournal ? new Date(modalJournal.published_at || modalJournal.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
        title={modalJournal?.title || ""}
      >
        {modalJournal?.cover_image && (
          <div className="journal-modal-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={modalJournal.cover_image} alt={modalJournal.title} />
          </div>
        )}
        {modalJournal?.excerpt && (
          <p className="journal-modal-excerpt">{modalJournal.excerpt}</p>
        )}
        <div className="journal-modal-body">
          {(modalJournal?.content || "").split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </InfoModal>

      <InfoModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        subtitle="Last updated"
        title="Terms of Service"
      >
        <div className="legal-modal-content">
          {TERMS_CONTENT.map((s, i) => (
            <section key={i}>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </section>
          ))}
        </div>
      </InfoModal>

      <InfoModal
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        subtitle="Last updated"
        title="Privacy Policy"
      >
        <div className="legal-modal-content">
          {PRIVACY_CONTENT.map((s, i) => (
            <section key={i}>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </section>
          ))}
        </div>
      </InfoModal>
    </>
  );
}

function ArrowIcon() {
  return (
    <span className="link-arrow" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17L17 7M17 7H8M17 7v9" />
      </svg>
    </span>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="newsletter reveal reveal-up">
      <div className="section-head">
        <div className="line"></div>
        <h2 className="section-title">Stay in Touch</h2>
        <div className="line"></div>
      </div>
      <p className="section-sub">new drops, my favourites, the occasional postcard</p>
      {status === "success" ? (
        <div className="newsletter-success">
          <span>✓</span>
          <p>You're on the list. See you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="newsletter-form">
          <input
            type="email"
            placeholder="your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading"}
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="newsletter-error">Something went wrong. Try again?</p>
      )}
    </section>
  );
}
