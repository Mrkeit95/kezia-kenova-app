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

  const settings = settingsRes.data || {};
  const layout = Array.isArray(settings.homepage_layout) && settings.homepage_layout.length > 0
    ? settings.homepage_layout
    : null;

  return (
    <HomePage
      products={productsRes.data || []}
      settings={settings}
      looks={looksRes.data || []}
      sections={sectionsRes.data || []}
      videos={videosRes.data || []}
      layout={layout}
    />
  );
}
