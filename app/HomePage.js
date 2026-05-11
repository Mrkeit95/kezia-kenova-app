"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import ProductCarousel from "@/components/ProductCarousel";
import ProductModal from "@/components/ProductModal";
import "./globals.css";
import "./home.css";

const DEFAULTS = {
  location: "Bali · Indonesia",
  tagline: "model · creator · storyteller",
  instagram_url: "https://www.instagram.com/keziaken/",
  tiktok_url: "https://www.tiktok.com/@keziaken",
  email: "keziakenwork@gmail.com",
  hero_image: "/kezia.jpeg",
};

const FALLBACK_PRODUCTS = [
  { id: "f1", category: "Jewellery", title: "Gold Chain Necklace", brand: "Mejuri", price: "$120", featured: true, image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80", affiliate_url: "#", description: "A delicate 14k gold-filled chain that goes with everything." },
  { id: "f2", category: "Jewellery", title: "Pearl Drop Earrings", brand: "Missoma", price: "$95", featured: false, image_url: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80", affiliate_url: "#", description: "Freshwater pearls on gold-vermeil hooks." },
  { id: "f3", category: "Jewellery", title: "Stacking Rings Set", brand: "Catbird", price: "$180", featured: true, image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80", affiliate_url: "#", description: "Three thin bands designed to stack." },
  { id: "f4", category: "Jewellery", title: "Tennis Bracelet", brand: "Monica Vinader", price: "$240", featured: false, image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80", affiliate_url: "#", description: "A modern, refined take on the classic." },
  { id: "f5", category: "Makeup", title: "Signature Nude Lip", brand: "Charlotte Tilbury", price: "$38", featured: true, image_url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80", affiliate_url: "#", description: "My go-to neutral lip." },
  { id: "f6", category: "Makeup", title: "Skin Tint Foundation", brand: "Rare Beauty", price: "$32", featured: false, image_url: "https://images.unsplash.com/photo-1631214540242-3cd8c4b0b3b8?w=600&q=80", affiliate_url: "#", description: "Lightweight, buildable, never cakey." },
  { id: "f7", category: "Makeup", title: "Liquid Highlighter", brand: "Fenty Beauty", price: "$36", featured: false, image_url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&q=80", affiliate_url: "#", description: "Lit-from-within glow, no glitter." },
  { id: "f8", category: "Makeup", title: "Cream Blush Stick", brand: "Westman Atelier", price: "$48", featured: false, image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80", affiliate_url: "#", description: "Buildable cream that melts into skin." },
  { id: "f9", category: "Fashion", title: "Oversized Blazer", brand: "Reformation", price: "$298", featured: true, image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80", affiliate_url: "#", description: "The blazer I reach for endlessly." },
  { id: "f10", category: "Fashion", title: "Silk Slip Dress", brand: "Réalisation Par", price: "$220", featured: false, image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80", affiliate_url: "#", description: "Silk satin that drapes beautifully." },
  { id: "f11", category: "Fashion", title: "Leather Tote Bag", brand: "Polène", price: "$520", featured: false, image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80", affiliate_url: "#", description: "Structured, polished, holds everything." },
  { id: "f12", category: "Fashion", title: "Strappy Sandals", brand: "The Row", price: "$890", featured: false, image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80", affiliate_url: "#", description: "Minimal, surprisingly walkable." },
  { id: "f13", category: "Skincare", title: "Vitamin C Serum", brand: "Drunk Elephant", price: "$80", featured: false, image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", affiliate_url: "#", description: "Brightens and evens skin tone." },
  { id: "f14", category: "Skincare", title: "Hydrating Cream", brand: "Augustinus Bader", price: "$185", featured: true, image_url: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=600&q=80", affiliate_url: "#", description: "Plumps, smooths, and softens skin." },
  { id: "f15", category: "Skincare", title: "Daily SPF 50", brand: "Supergoop", price: "$38", featured: false, image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80", affiliate_url: "#", description: "Invisible, no white cast, non-negotiable in Bali." },
  { id: "f16", category: "Skincare", title: "Gentle Cleanser", brand: "Tatcha", price: "$48", featured: false, image_url: "https://images.unsplash.com/photo-1620916297893-9d33ed5b3683?w=600&q=80", affiliate_url: "#", description: "Rice-based, never strips skin." },
];

const SECTION_SUBS = {
  Jewellery: "the pieces I never take off",
  Makeup: "my five-minute face",
  Fashion: "what I actually wear",
  Skincare: "the routine that keeps my skin glowing",
};

export default function HomePage({ products, settings, looks, journalPosts }) {
  const s = { ...DEFAULTS, ...settings };
  const list = products.length > 0 ? products : FALLBACK_PRODUCTS;
  const [modalProduct, setModalProduct] = useState(null);

  // Lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = modalProduct ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalProduct]);

  // Scroll-reveal animation observer
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

  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="shell">
          <div className="hero">
            <div className="frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.hero_image} alt="Kezia Kenova" />
              <div className="frame-glow"></div>
            </div>
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

          {/* BEST SELLERS */}
          {bestSellers.length > 0 && (
            <section className="section reveal reveal-up">
              <div className="section-head">
                <div className="line"></div>
                <h2 className="section-title">Best Sellers</h2>
                <div className="line"></div>
              </div>
              <p className="section-sub">the ones you keep asking me about</p>
              <ProductCarousel products={bestSellers} onProductClick={setModalProduct} />
            </section>
          )}

          {/* GET THE LOOK */}
          {looks && looks.length > 0 && (
            <section className="section reveal reveal-left">
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

          {/* CATEGORY CAROUSELS */}
          {sections.map((cat, idx) => {
            const preview = grouped[cat].slice(0, 8);
            const revealClass = idx % 2 === 0 ? "reveal-up" : "reveal-right";
            return (
              <section key={cat} className={`section reveal ${revealClass}`}>
                <div className="section-head">
                  <div className="line"></div>
                  <h2 className="section-title">{cat}</h2>
                  <div className="line"></div>
                </div>
                {SECTION_SUBS[cat] && <p className="section-sub">{SECTION_SUBS[cat]}</p>}
                <ProductCarousel products={preview} onProductClick={setModalProduct} />
                <div className="view-all-wrap">
                  <Link href={`/category/${cat.toLowerCase()}`} className="view-all">
                    View all {grouped[cat].length} {cat.toLowerCase()} ›
                  </Link>
                </div>
              </section>
            );
          })}

          {/* JOURNAL */}
          {journalPosts && journalPosts.length > 0 && (
            <section className="section reveal reveal-up">
              <div className="section-head">
                <div className="line"></div>
                <h2 className="section-title">Journal</h2>
                <div className="line"></div>
              </div>
              <p className="section-sub">stories, thoughts, places I've been</p>
              <div className="journal-list">
                {journalPosts.map((post) => (
                  <Link key={post.id} href={`/journal/${post.slug}`} className="journal-card">
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
                  </Link>
                ))}
              </div>
              <div className="view-all-wrap">
                <Link href="/journal" className="view-all">All journal entries ›</Link>
              </div>
            </section>
          )}

          <NewsletterForm />

          <footer className="footer reveal reveal-up">
            <div className="rule"></div>
            <div className="footer-links">
              <Link href="/journal">Journal</Link>
              <span className="footer-dot">·</span>
              <Link href="/terms">Terms</Link>
              <span className="footer-dot">·</span>
              <Link href="/privacy">Privacy</Link>
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
