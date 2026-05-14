import { createClient } from "@/lib/supabase-server";
import AdminNav from "./AdminNav";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createClient();

  const [productsRes, clicksRes, weekClicksRes, topProductsRes, looksRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("clicks").select("id", { count: "exact", head: true }),
    supabase.from("clicks").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("clicks").select("product_id, products(title, brand, image_url)").gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("looks").select("id", { count: "exact", head: true }),
  ]);

  // Aggregate top products from last 30 days
  const counts = {};
  (topProductsRes.data || []).forEach((c) => {
    if (!c.products) return;
    if (!counts[c.product_id]) {
      counts[c.product_id] = { ...c.products, count: 0 };
    }
    counts[c.product_id].count += 1;
  });
  const topProducts = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 3);

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
            <Link href="/admin/products" className="stat-card stat-card-link">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12l3 6-9 12L3 9z" />
                </svg>
              </div>
              <div className="stat-label">Products</div>
              <div className="stat-value">{productsRes.count ?? 0}</div>
              <div className="stat-meta">active items</div>
            </Link>

            <Link href="/admin/analytics" className="stat-card stat-card-link">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 17l6-6 4 4 8-8" />
                  <path d="M14 7h7v7" />
                </svg>
              </div>
              <div className="stat-label">Clicks (7d)</div>
              <div className="stat-value">{weekClicksRes.count ?? 0}</div>
              <div className="stat-meta">{clicksRes.count ?? 0} total</div>
            </Link>

            <Link href="/admin/looks" className="stat-card stat-card-link">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zM4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <div className="stat-label">Looks</div>
              <div className="stat-value">{looksRes.count ?? 0}</div>
              <div className="stat-meta">outfits live</div>
            </Link>
          </div>

          <div className="admin-row">
            <div className="admin-section admin-flex-1">
              <div className="admin-section-head">
                <h2 className="admin-section-title">Top Products · 30 days</h2>
                <Link href="/admin/analytics" className="btn-ghost">View all</Link>
              </div>
              {topProducts.length === 0 ? (
                <div className="empty-state">No clicks yet. Share your site and check back here.</div>
              ) : (
                <div className="dashboard-top-list">
                  {topProducts.map((p, i) => (
                    <div key={i} className="dashboard-top-item">
                      <div className="dashboard-top-rank">{i + 1}</div>
                      <div className="dashboard-top-img">
                        {p.image_url && <img src={p.image_url} alt="" />}
                      </div>
                      <div className="dashboard-top-info">
                        <div className="dashboard-top-title">{p.title}</div>
                        <div className="dashboard-top-brand">{p.brand}</div>
                      </div>
                      <div className="dashboard-top-count">
                        <span>{p.count}</span>
                        <small>clicks</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </div>

          <div className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link href="/admin/products" className="quick-action">
                <span className="quick-action-icon">+</span>
                <span className="quick-action-text">Add Product</span>
              </Link>
              <Link href="/admin/looks" className="quick-action">
                <span className="quick-action-icon">◇</span>
                <span className="quick-action-text">Create Look</span>
              </Link>
              <Link href="/admin/settings" className="quick-action">
                <span className="quick-action-icon">⚙</span>
                <span className="quick-action-text">Settings</span>
              </Link>
              <Link href="/" target="_blank" className="quick-action">
                <span className="quick-action-icon">↗</span>
                <span className="quick-action-text">Preview Site</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
