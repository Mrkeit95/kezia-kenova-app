import { createClient } from "@/lib/supabase-server";
import AdminNav from "../AdminNav";
import SubscribersTools from "./SubscribersTools";

export default async function SubscribersPage() {
  const supabase = createClient();
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminNav />
      <main className="admin-page">
        <div className="grain"></div>
        <div className="admin-main">
          <div className="admin-header">
            <h1 className="admin-title">Subscribers</h1>
            <p className="admin-subtitle">{(subscribers || []).length} people on your list</p>
          </div>

          <div className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">Email List</h2>
              <SubscribersTools subscribers={subscribers || []} />
            </div>

            {(!subscribers || subscribers.length === 0) ? (
              <div className="empty-state">
                No subscribers yet. Once people sign up on your site, they'll appear here.
              </div>
            ) : (
              <div>
                {subscribers.map((s) => (
                  <div key={s.id} className="subscriber-row">
                    <span className="subscriber-email">{s.email}</span>
                    <span className="subscriber-date">
                      {new Date(s.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
