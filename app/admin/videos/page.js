import { createClient } from "@/lib/supabase-server";
import AdminNav from "../AdminNav";
import VideosManager from "./VideosManager";

export default async function VideosPage() {
  const supabase = createClient();
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .order("platform")
    .order("sort_order", { ascending: true });

  return (
    <>
      <AdminNav />
      <main className="admin-page">
        <div className="grain"></div>
        <div className="admin-main">
          <div className="admin-header">
            <h1 className="admin-title">Videos</h1>
            <p className="admin-subtitle">Manage your TikTok and Instagram videos shown on the homepage</p>
          </div>
          <VideosManager initialVideos={videos || []} />
        </div>
      </main>
    </>
  );
}
