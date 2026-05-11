"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import ProductModal from "@/components/ProductModal";
import BackButton from "@/components/BackButton";
import "../../globals.css";
import "../../home.css";
import "./category.css";

export default function CategoryPage({ category, subtitle, products }) {
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    document.body.style.overflow = modalProduct ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalProduct]);

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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [products]);

  // Back link with hash to scroll to category section on homepage
  const backHref = `/#category-${category.toLowerCase()}`;

  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="cat-shell">
          <div className="detail-nav">
            <BackButton href={backHref} label="Back" />
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
              {products.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setModalProduct(p)}
                  className="cat-card reveal reveal-up"
                  style={{ transitionDelay: `${(i % 6) * 60}ms` }}
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
                </button>
              ))}
            </div>
          )}

          <footer className="footer" style={{ marginTop: 60 }}>
            <div className="rule"></div>
            <p>© {new Date().getFullYear()} Kezia Kenova</p>
          </footer>
        </div>
      </main>

      {modalProduct && <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />}
    </>
  );
}
