import { createClient } from "@/lib/supabase-server";
import HomePage from "./HomePage";

export default async function Page() {
  const supabase = createClient();

  const [productsRes, settingsRes, looksRes, sectionsRes, videosRes] = await Promise.all([
    supabase.from("products").select("*").eq("visible", true).order("sort_order", { ascending: true }),
    supabase.from("settings").select("*").single(),
    supabase.from("looks").select("*").eq("visible", true).order("sort_order", { ascending: true }),
    supabase.from("sections").select("*").eq("visible", true).order("sort_order", { ascending: true }),
    supabase.from("videos").select("*").eq("visible", true).order("sort_order", { ascending: true }),
  ]);

  return (
    <HomePage
      products={productsRes.data || []}
      settings={settingsRes.data || {}}
      looks={looksRes.data || []}
      sections={sectionsRes.data || []}
      videos={videosRes.data || []}
    />
  );
}
