"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import "../../globals.css";
import "../../home.css";
import "./category.css";

export default function CategoryPage({ category, subtitle, products }) {
  const router = useRouter();

  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="cat-shell">
          <div className="detail-nav">
            <Link href="/" className="detail-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Back</span>
            </Link>
          </div>

          <div className="cat-header">
            <div className="section-head">
              <div className="line"></div>
              <h1 className="cat-title">{category}</h1>
              <div className="line"></div>
            </div>
            {subtitle && <p className="section-sub">{subtitle}</p>}
            <p className="cat-count">{products.length} {products.length === 1 ? "item" : "items"}</p>
          </div>

          {products.length === 0 ? (
            <p className="cat-empty">No items in this category yet.</p>
          ) : (
            <div className="cat-grid">
              {products.map((p) => (
                <a
                  key={p.id}
                  href={`/product/${p.id}`}
                  onClick={(e) => { e.preventDefault(); router.push(`/product/${p.id}`); }}
                  className="cat-card"
                >
                  <div className="cat-card-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url} alt={p.title} loading="lazy" />
                  </div>
                  <div className="cat-card-body">
                    <div className="cat-card-title">{p.title}</div>
                    <div className="cat-card-meta">
                      <span>{p.brand}</span>
                      {p.price && <span className="cat-card-price">{p.price}</span>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          <footer className="footer" style={{ marginTop: 60 }}>
            <div className="rule"></div>
            <div className="footer-links">
              <Link href="/terms">Terms</Link>
              <span className="footer-dot">·</span>
              <Link href="/privacy">Privacy</Link>
            </div>
            <p>© {new Date().getFullYear()} Kezia Kenova</p>
          </footer>
        </div>
      </main>
    </>
  );
}
