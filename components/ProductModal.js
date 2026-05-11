"use client";

import { useEffect, useState } from "react";

export default function ProductModal({ product, onClose }) {
  const [closing, setClosing] = useState(false);
  const [activeImage, setActiveImage] = useState(product.image_url);

  const allImages = [
    product.image_url,
    ...(product.extra_images || []),
  ].filter(Boolean);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 280);
  };

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
    <div
      className={`product-modal-overlay ${closing ? "closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`product-modal ${closing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="product-modal-close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="product-modal-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeImage} alt={product.title} />
        </div>

        {allImages.length > 1 && (
          <div className="product-modal-thumbs">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`product-modal-thumb ${activeImage === img ? "active" : ""}`}
                aria-label={`View image ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="product-modal-body">
          {product.brand && <div className="product-modal-brand">{product.brand}</div>}
          <h2 className="product-modal-title">{product.title}</h2>
          {product.price && <div className="product-modal-price">{product.price}</div>}

          {product.description && (
            <p className="product-modal-description">{product.description}</p>
          )}

          <button onClick={handleShop} className="product-modal-shop">
            <span>Shop Now</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M17 7H8M17 7v9" />
            </svg>
          </button>

          <p className="product-modal-disclaimer">
            Affiliate link — I may earn a small commission, at no cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}
