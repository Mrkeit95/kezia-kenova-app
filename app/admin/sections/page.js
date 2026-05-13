import { createClient } from "@/lib/supabase-server";
import AdminNav from "../AdminNav";
import SectionsManager from "./SectionsManager";

export default async function SectionsPage() {
  const supabase = createClient();

  const [{ data: sections }, { data: products }] = await Promise.all([
    supabase.from("sections").select("*").order("sort_order", { ascending: true }),
    supabase.from("products").select("*").eq("visible", true).order("category").order("sort_order"),
  ]);

  return (
    <>
      <AdminNav />
      <main className="admin-page">
        <div className="grain"></div>
        <div className="admin-main">
          <div className="admin-header">
            <h1 className="admin-title">Sections</h1>
            <p className="admin-subtitle">Build and manage the sections that appear on your homepage</p>
          </div>
          <SectionsManager initialSections={sections || []} allProducts={products || []} />
        </div>
      </main>
    </>
  );
}
