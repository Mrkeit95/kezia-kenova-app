import { createClient } from "@/lib/supabase-server";
import AdminNav from "../AdminNav";
import JournalManager from "./JournalManager";

export default async function JournalAdminPage() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("journal_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminNav />
      <main className="admin-page">
        <div className="grain"></div>
        <div className="admin-main">
          <div className="admin-header">
            <h1 className="admin-title">Journal</h1>
            <p className="admin-subtitle">Write and publish your stories</p>
          </div>
          <JournalManager initialPosts={posts || []} />
        </div>
      </main>
    </>
  );
}
