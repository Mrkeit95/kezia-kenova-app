"use client";

import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import "../../globals.css";
import "../../home.css";
import "./detail.css";

export default function ProductDetail({ product }) {
  const handleShop = async () => {
    if (!product.id.startsWith("f")) {
      try {
        await fetch("/api/track-click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id }),
        });
      } catch {}
    }
    if (product.affiliate_url && product.affiliate_url !== "#") {
      window.open(product.affiliate_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="detail-shell">
          <div className="detail-nav">
            <Link href="/" className="detail-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Back</span>
            </Link>
            <Link href={`/category/${product.category.toLowerCase()}`} className="detail-category">
              {product.category}
            </Link>
          </div>

          <div className="detail-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image_url} alt={product.title} />
          </div>

          <div className="detail-content">
            {product.brand && <div className="detail-brand">{product.brand}</div>}
            <h1 className="detail-title">{product.title}</h1>
            {product.price && <div className="detail-price">{product.price}</div>}

            {product.description && (
              <p className="detail-description">{product.description}</p>
            )}

            <button onClick={handleShop} className="detail-shop">
              <span>Shop Now</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H8M17 7v9" />
              </svg>
            </button>

            <p className="detail-disclaimer">
              Affiliate link — I may earn a small commission, at no cost to you.
            </p>
          </div>

          <footer className="footer">
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
