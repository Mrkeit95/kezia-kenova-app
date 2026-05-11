import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import LookDetail from "./LookDetail";

export default async function LookPage({ params }) {
  const supabase = createClient();

  const { data: look } = await supabase
    .from("looks")
    .select("*")
    .eq("id", params.id)
    .eq("visible", true)
    .single();

  if (!look) notFound();

  // Fetch the products in this look
  let products = [];
  if (look.product_ids && look.product_ids.length > 0) {
    const { data: prods } = await supabase
      .from("products")
      .select("*")
      .in("id", look.product_ids)
      .eq("visible", true);
    products = prods || [];
  }

  return <LookDetail look={look} products={products} />;
}
