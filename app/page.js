import { createClient } from "@/lib/supabase-server";
import HomePage from "./HomePage";

export default async function Page() {
  const supabase = createClient();

  // Fetch products grouped by category, ordered
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });

  // Fetch settings (bio, location, social links)
  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .single();

  return <HomePage products={products || []} settings={settings || {}} />;
}
