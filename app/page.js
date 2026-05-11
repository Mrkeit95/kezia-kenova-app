import { createClient } from "@/lib/supabase-server";
import HomePage from "./HomePage";

export default async function Page() {
  const supabase = createClient();

  const [productsRes, settingsRes, looksRes, journalRes] = await Promise.all([
    supabase.from("products").select("*").eq("visible", true).order("sort_order", { ascending: true }),
    supabase.from("settings").select("*").single(),
    supabase.from("looks").select("*").eq("visible", true).order("sort_order", { ascending: true }),
    supabase.from("journal_posts").select("*").eq("published", true).order("published_at", { ascending: false }).limit(3),
  ]);

  return (
    <HomePage
      products={productsRes.data || []}
      settings={settingsRes.data || {}}
      looks={looksRes.data || []}
      journalPosts={journalRes.data || []}
    />
  );
}
