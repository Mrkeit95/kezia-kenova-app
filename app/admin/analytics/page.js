import { createClient } from "@/lib/supabase-server";
import AdminNav from "../AdminNav";

export default async function AnalyticsPage() {
  const supabase = createClient();

  // Get all clicks with product info
  const { data: clicks } = await supabase
    .from("clicks")
    .select("product_id, created_at, products(title, brand, category)")
    .order("created_at", { ascending: false });

  // Aggregate clicks per product
  const counts = {};
  (clicks || []).forEach((c) => {
    if (!c.products) return;
    const key = c.product_id;
    if (!counts[key]) {
      counts[key] = {
        title: c.products.title,
        brand: c.products.brand,
        category: c.products.category,
        count: 0,
      };
    }
    counts[key].count += 1;
  });

  const topProducts = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 20);
  const totalClicks = (clicks || []).length;

  // Clicks per day for the last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayClicks = (clicks || []).filter(
      (c) => c.created_at.slice(0, 10) === dayStr
    ).length;
    days.push({ label: dayLabel, count: dayClicks });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  return (
    <>
      <AdminNav />
      <main className="admin-page">
        <div className="grain"></div>
        <div className="admin-main">
          <div className="admin-header">
            <h1 className="admin-title">Analytics</h1>
            <p className="admin-subtitle">{totalClicks} total clicks tracked</p>
          </div>

          <div className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">Last 7 Days</h2>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 180, padding: "20px 0" }}>
              {days.map((d) => (
                <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 11, color: "#d4a574", fontFamily: "Cormorant Garamond, serif" }}>
                    {d.count}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: `${(d.count / maxDay) * 130}px`,
                      background: "linear-gradient(180deg, rgba(212,165,116,0.6), rgba(212,165,116,0.2))",
                      borderRadius: "2px 2px 0 0",
                      minHeight: 2,
                      transition: "height 0.4s ease",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(232,223,210,0.45)",
                    }}
                  >
                    {d.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">Top Products</h2>
            </div>
            {topProducts.length === 0 ? (
              <div className="empty-state">
                No clicks yet. Share your site and check back here.
              </div>
            ) : (
              <div className="product-list">
                {topProducts.map((p, i) => (
                  <div key={i} className="product-row" style={{ gridTemplateColumns: "40px 1fr auto" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: 22,
                        color: "#d4a574",
                        border: "1px solid rgba(212, 165, 116, 0.3)",
                        borderRadius: "50%",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="product-row-info">
                      <div className="product-row-title">{p.title}</div>
                      <div className="product-row-meta">
                        <span>{p.brand}</span>
                        <span className="tag">{p.category}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: 24,
                        color: "#f4ead9",
                      }}
                    >
                      {p.count}
                      <span style={{ fontSize: 10, marginLeft: 6, color: "rgba(232,223,210,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                        clicks
                      </span>
                    </div>
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
