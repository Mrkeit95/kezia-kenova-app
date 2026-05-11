import { createClient } from "@/lib/supabase-server";
import AdminNav from "../AdminNav";
import ProductsManager from "./ProductsManager";

export default async function ProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  return (
    <>
      <AdminNav />
      <main className="admin-page">
        <div className="grain"></div>
        <div className="admin-main">
          <div className="admin-header">
            <h1 className="admin-title">Products</h1>
            <p className="admin-subtitle">Add, edit, and organise your affiliate items</p>
          </div>
          <ProductsManager initialProducts={products || []} />
        </div>
      </main>
    </>
  );
}
