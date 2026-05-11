"use client";

import { useRouter } from "next/navigation";

export default function ProductCarousel({ products }) {
  const router = useRouter();

  const handleClick = (e, product) => {
    e.preventDefault();
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="carousel-wrap">
      <div className="carousel">
        {products.map((p) => (
          <a
            key={p.id}
            href={`/product/${p.id}`}
            onClick={(e) => handleClick(e, p)}
            className="carousel-card"
          >
            <div className="carousel-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt={p.title} loading="lazy" />
            </div>
            <div className="carousel-body">
              <div className="carousel-title">{p.title}</div>
              <div className="carousel-meta">
                <span className="carousel-brand">{p.brand}</span>
                {p.price && <span className="carousel-price">{p.price}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
