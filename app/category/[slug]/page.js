import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import CategoryPage from "./CategoryPage";

export async function generateMetadata({ params }) {
  const supabase = createClient();
  const { data: section } = await supabase
    .from("sections")
    .select("title, subtitle")
    .eq("slug", params.slug)
    .eq("visible", true)
    .single();

  return {
    title: section ? `${section.title} · Kezia Ken` : "Kezia Ken",
    description: section?.subtitle,
  };
}

export default async function Page({ params }) {
  const { slug } = params;
  const supabase = createClient();

  // Look up the section by slug
  const { data: section } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", slug)
    .eq("visible", true)
    .single();

  if (!section) notFound();

  // Fetch products in this section by their IDs
  let products = [];
  if (section.product_ids && section.product_ids.length > 0) {
    const { data: prods } = await supabase
      .from("products")
      .select("*")
      .in("id", section.product_ids)
      .eq("visible", true);

    // Preserve section's sort order
    const idOrder = section.product_ids;
    products = (prods || []).sort(
      (a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id)
    );
  }

  return (
    <CategoryPage
      category={section.title}
      subtitle={section.subtitle}
      slug={slug}
      products={products}
    />
  );
}
