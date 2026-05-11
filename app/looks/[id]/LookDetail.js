"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import ProductModal from "@/components/ProductModal";
import BackButton from "@/components/BackButton";
import "../../globals.css";
import "../../home.css";
import "../looks.css";

export default function LookDetail({ look, products }) {
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    document.body.style.overflow = modalProduct ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalProduct]);

  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="look-detail-shell">
          <div className="detail-nav">
            <BackButton href="/#looks" label="Back to looks" />
          </div>

          <div className="look-detail-cover">
            {look.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={look.cover_image} alt={look.title} />
            )}
          </div>

          <div className="look-detail-header">
            <h1 className="look-detail-title">{look.title}</h1>
            {look.description && <p className="look-detail-description">{look.description}</p>}
          </div>

          {products.length > 0 && (
            <>
              <div className="look-divider">
                <div className="line"></div>
                <span>Shop the Look</span>
                <div className="line"></div>
              </div>

              <div className="look-products-grid">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setModalProduct(p)}
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
                  </button>
                ))}
              </div>
            </>
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
