import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";

// Fallback for the demo products before real ones are added
const FALLBACK_MAP = {
  f1: { id: "f1", category: "Jewellery", title: "Gold Chain Necklace", brand: "Mejuri", price: "$120", description: "A delicate 14k gold-filled chain that goes with everything. I wear mine layered with longer pieces, but it works just as well solo for a clean, minimal look.", image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80", affiliate_url: "#" },
  f2: { id: "f2", category: "Jewellery", title: "Pearl Drop Earrings", brand: "Missoma", price: "$95", description: "Freshwater pearls on gold-vermeil hooks. Lightweight enough to wear all day, dressy enough for evenings.", image_url: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=1200&q=80", affiliate_url: "#" },
  f3: { id: "f3", category: "Jewellery", title: "Stacking Rings Set", brand: "Catbird", price: "$180", description: "A set of three thin bands designed to stack. The mix of textures catches light beautifully.", image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80", affiliate_url: "#" },
  f4: { id: "f4", category: "Jewellery", title: "Tennis Bracelet", brand: "Monica Vinader", price: "$240", description: "A modern take on the classic — slim, refined, and surprisingly versatile.", image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80", affiliate_url: "#" },
  f5: { id: "f5", category: "Makeup", title: "Signature Nude Lip", brand: "Charlotte Tilbury", price: "$38", description: "My go-to neutral. A creamy, hydrating formula in a flattering rose-nude tone.", image_url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1200&q=80", affiliate_url: "#" },
  f6: { id: "f6", category: "Makeup", title: "Skin Tint Foundation", brand: "Rare Beauty", price: "$32", description: "Lightweight, buildable, and never cakey. Lets my skin still look like skin.", image_url: "https://images.unsplash.com/photo-1631214540242-3cd8c4b0b3b8?w=1200&q=80", affiliate_url: "#" },
  f7: { id: "f7", category: "Makeup", title: "Liquid Highlighter", brand: "Fenty Beauty", price: "$36", description: "Adds a lit-from-within glow without any glitter. A few drops mixed into foundation transform everything.", image_url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1200&q=80", affiliate_url: "#" },
  f8: { id: "f8", category: "Makeup", title: "Cream Blush Stick", brand: "Westman Atelier", price: "$48", description: "Buildable cream that melts into skin. The rosy peach shade looks like a natural flush.", image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&q=80", affiliate_url: "#" },
  f9: { id: "f9", category: "Fashion", title: "Oversized Blazer", brand: "Reformation", price: "$298", description: "The blazer I reach for endlessly. Throw it over a slip dress, a tee and jeans, anything.", image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80", affiliate_url: "#" },
  f10: { id: "f10", category: "Fashion", title: "Silk Slip Dress", brand: "Réalisation Par", price: "$220", description: "Silk satin that drapes beautifully. Equally at home at dinner as it is layered with a tee underneath.", image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1200&q=80", affiliate_url: "#" },
  f11: { id: "f11", category: "Fashion", title: "Leather Tote Bag", brand: "Polène", price: "$520", description: "A structured tote that holds everything but still looks polished. Worth the investment.", image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80", affiliate_url: "#" },
  f12: { id: "f12", category: "Fashion", title: "Strappy Sandals", brand: "The Row", price: "$890", description: "Minimal, elegant, surprisingly walkable. The pair I pack first for every trip.", image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=80", affiliate_url: "#" },
  f13: { id: "f13", category: "Skincare", title: "Vitamin C Serum", brand: "Drunk Elephant", price: "$80", description: "Brightens, evens skin tone, and pairs well with everything. The first step in my morning routine.", image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80", affiliate_url: "#" },
  f14: { id: "f14", category: "Skincare", title: "Hydrating Cream", brand: "Augustinus Bader", price: "$185", description: "The cream that converted me. Plumps, smooths, and gives skin that lit-from-within softness.", image_url: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=1200&q=80", affiliate_url: "#" },
  f15: { id: "f15", category: "Skincare", title: "Daily SPF 50", brand: "Supergoop", price: "$38", description: "Invisible, no white cast, works under makeup. Living in Bali, this is non-negotiable.", image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1200&q=80", affiliate_url: "#" },
  f16: { id: "f16", category: "Skincare", title: "Gentle Cleanser", brand: "Tatcha", price: "$48", description: "A rice-based cleanser that never strips. Leaves skin soft and balanced.", image_url: "https://images.unsplash.com/photo-1620916297893-9d33ed5b3683?w=1200&q=80", affiliate_url: "#" },
};

export default async function Page({ params }) {
  const { id } = params;

  // If it's a fallback id, use the local map
  if (id.startsWith("f") && FALLBACK_MAP[id]) {
    return <ProductDetail product={FALLBACK_MAP[id]} />;
  }

  // Otherwise fetch from DB
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("visible", true)
    .single();

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
