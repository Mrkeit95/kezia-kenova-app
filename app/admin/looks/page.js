import { createClient } from "@/lib/supabase-server";
import AdminNav from "../AdminNav";
import LooksManager from "./LooksManager";

export default async function LooksAdminPage() {
  const supabase = createClient();
  const [looksRes, productsRes] = await Promise.all([
    supabase.from("looks").select("*").order("sort_order", { ascending: true }),
    supabase.from("products").select("id, title, brand, category, image_url").order("category"),
  ]);

  return (
    <>
      <AdminNav />
      <main className="admin-page">
        <div className="grain"></div>
        <div className="admin-main">
          <div className="admin-header">
            <h1 className="admin-title">Looks</h1>
            <p className="admin-subtitle">Group products into complete outfits</p>
          </div>
          <LooksManager initialLooks={looksRes.data || []} allProducts={productsRes.data || []} />
        </div>
      </main>
    </>
  );
}
