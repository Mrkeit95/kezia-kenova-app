import { createClient } from "@/lib/supabase-server";
import AdminNav from "./AdminNav";

export default async function DashboardPage() {
  const supabase = createClient();

  const [productsResult, subsResult, clicksResult, recentClicksResult] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("subscribers").select("id", { count: "exact", head: true }),
    supabase.from("clicks").select("id", { count: "exact", head: true }),
    supabase
      .from("clicks")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const stats = [
    { label: "Products", value: productsResult.count ?? 0, meta: "active items on site" },
    { label: "Subscribers", value: subsResult.count ?? 0, meta: "emails collected" },
    { label: "Total Clicks", value: clicksResult.count ?? 0, meta: "affiliate link taps" },
    { label: "Clicks This Week", value: recentClicksResult.count ?? 0, meta: "last 7 days" },
  ];

  return (
    <>
      <AdminNav />
      <main className="admin-page">
        <div className="grain"></div>
        <div className="admin-main">
          <div className="admin-header">
            <h1 className="admin-title">Welcome back</h1>
            <p className="admin-subtitle">Your site at a glance</p>
          </div>

          <div className="stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-meta">{s.meta}</div>
              </div>
            ))}
          </div>

          <div className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">Quick Actions</h2>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/admin/products" className="btn-primary">Manage Products</a>
              <a href="/admin/subscribers" className="btn-ghost">View Subscribers</a>
              <a href="/admin/analytics" className="btn-ghost">View Analytics</a>
              <a href="/" target="_blank" className="btn-ghost">Preview Site ↗</a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
