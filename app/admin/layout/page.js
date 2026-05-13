import { createClient } from "@/lib/supabase-server";
import AdminNav from "../AdminNav";
import LayoutManager from "./LayoutManager";

export default async function LayoutPage() {
  const supabase = createClient();
  const [{ data: settings }, { data: sections }, { data: videos }] = await Promise.all([
    supabase.from("settings").select("homepage_layout").single(),
    supabase.from("sections").select("id, title, slug, visible").order("sort_order"),
    supabase.from("videos").select("platform, visible").order("platform"),
  ]);

  const hasTikTok = (videos || []).some((v) => v.platform === "tiktok" && v.visible);
  const hasInstagram = (videos || []).some((v) => v.platform === "instagram" && v.visible);

  return (
    <>
      <AdminNav />
      <main className="admin-page">
        <div className="grain"></div>
        <div className="admin-main">
          <div className="admin-header">
            <h1 className="admin-title">Page Layout</h1>
            <p className="admin-subtitle">Drag to reorder every section on your homepage</p>
          </div>
          <LayoutManager
            initialLayout={settings?.homepage_layout || null}
            sections={sections || []}
            hasTikTok={hasTikTok}
            hasInstagram={hasInstagram}
          />
        </div>
      </main>
    </>
  );
}
