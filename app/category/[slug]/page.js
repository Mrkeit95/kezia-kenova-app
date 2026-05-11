import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import CategoryPage from "./CategoryPage";

const VALID = ["jewellery", "makeup", "fashion", "skincare"];

// Fallback products for when DB is empty
const FALLBACK_BY_CATEGORY = {
  jewellery: [
    { id: "f1", category: "Jewellery", title: "Gold Chain Necklace", brand: "Mejuri", price: "$120", image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80" },
    { id: "f2", category: "Jewellery", title: "Pearl Drop Earrings", brand: "Missoma", price: "$95", image_url: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80" },
    { id: "f3", category: "Jewellery", title: "Stacking Rings Set", brand: "Catbird", price: "$180", image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80" },
    { id: "f4", category: "Jewellery", title: "Tennis Bracelet", brand: "Monica Vinader", price: "$240", image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80" },
  ],
  makeup: [
    { id: "f5", category: "Makeup", title: "Signature Nude Lip", brand: "Charlotte Tilbury", price: "$38", image_url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80" },
    { id: "f6", category: "Makeup", title: "Skin Tint Foundation", brand: "Rare Beauty", price: "$32", image_url: "https://images.unsplash.com/photo-1631214540242-3cd8c4b0b3b8?w=600&q=80" },
    { id: "f7", category: "Makeup", title: "Liquid Highlighter", brand: "Fenty Beauty", price: "$36", image_url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&q=80" },
    { id: "f8", category: "Makeup", title: "Cream Blush Stick", brand: "Westman Atelier", price: "$48", image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80" },
  ],
  fashion: [
    { id: "f9", category: "Fashion", title: "Oversized Blazer", brand: "Reformation", price: "$298", image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80" },
    { id: "f10", category: "Fashion", title: "Silk Slip Dress", brand: "Réalisation Par", price: "$220", image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80" },
    { id: "f11", category: "Fashion", title: "Leather Tote Bag", brand: "Polène", price: "$520", image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80" },
    { id: "f12", category: "Fashion", title: "Strappy Sandals", brand: "The Row", price: "$890", image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80" },
  ],
  skincare: [
    { id: "f13", category: "Skincare", title: "Vitamin C Serum", brand: "Drunk Elephant", price: "$80", image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80" },
    { id: "f14", category: "Skincare", title: "Hydrating Cream", brand: "Augustinus Bader", price: "$185", image_url: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=600&q=80" },
    { id: "f15", category: "Skincare", title: "Daily SPF 50", brand: "Supergoop", price: "$38", image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80" },
    { id: "f16", category: "Skincare", title: "Gentle Cleanser", brand: "Tatcha", price: "$48", image_url: "https://images.unsplash.com/photo-1620916297893-9d33ed5b3683?w=600&q=80" },
  ],
};

const SUBS = {
  jewellery: "pieces I wear every day",
  makeup: "my everyday glow routine",
  fashion: "staples in my closet",
  skincare: "my morning to night ritual",
};

export default async function Page({ params }) {
  const { slug } = params;
  if (!VALID.includes(slug.toLowerCase())) notFound();

  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("visible", true)
    .eq("category", categoryName)
    .order("sort_order", { ascending: true });

  const list = (products && products.length > 0) ? products : (FALLBACK_BY_CATEGORY[slug.toLowerCase()] || []);

  return <CategoryPage category={categoryName} subtitle={SUBS[slug.toLowerCase()]} products={list} />;
}
