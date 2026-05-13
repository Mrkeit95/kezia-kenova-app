import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import BackButton from "@/components/BackButton";
import "../globals.css";
import "../home.css";
import "./looks.css";

export const metadata = { title: "Looks · Kezia Ken" };

export default async function LooksIndex() {
  const supabase = createClient();
  const { data: looks } = await supabase
    .from("looks")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });

  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="looks-shell">
          <div className="detail-nav">
            <BackButton href="/#looks" label="Back" />
          </div>

          <header className="looks-header">
            <div className="section-head">
              <div className="line"></div>
              <h1 className="cat-title">Get the Look</h1>
              <div className="line"></div>
            </div>
            <p className="section-sub">full outfits, head to toe</p>
          </header>

          {(!looks || looks.length === 0) ? (
            <p className="cat-empty">No looks yet.</p>
          ) : (
            <div className="looks-index-grid">
              {looks.map((look) => (
                <Link key={look.id} href={`/looks/${look.id}`} className="look-card">
                  <div className="look-img">
                    {look.cover_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={look.cover_image} alt={look.title} loading="lazy" />
                    )}
                  </div>
                  <div className="look-body">
                    <div className="look-title">{look.title}</div>
                    <div className="look-shop">Shop the look ›</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <footer className="footer" style={{ marginTop: 60 }}>
            <div className="rule"></div>
            <p>© {new Date().getFullYear()} Kezia Ken</p>
          </footer>
        </div>
      </main>
    </>
  );
}
