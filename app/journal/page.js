import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import "../globals.css";
import "../home.css";
import "./journal.css";

export const metadata = { title: "Journal · Kezia Kenova" };

export default async function JournalIndex() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("journal_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="journal-shell">
          <div className="detail-nav">
            <Link href="/" className="detail-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Back</span>
            </Link>
          </div>

          <header className="journal-index-header">
            <div className="section-head">
              <div className="line"></div>
              <h1 className="cat-title">Journal</h1>
              <div className="line"></div>
            </div>
            <p className="section-sub">stories, thoughts, places I've been</p>
          </header>

          {(!posts || posts.length === 0) ? (
            <p className="cat-empty">No journal entries yet. Check back soon.</p>
          ) : (
            <div className="journal-index-list">
              {posts.map((post) => (
                <Link key={post.id} href={`/journal/${post.slug}`} className="journal-card">
                  {post.cover_image && (
                    <div className="journal-img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.cover_image} alt={post.title} loading="lazy" />
                    </div>
                  )}
                  <div className="journal-body">
                    <div className="journal-date">
                      {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                    <h2 className="journal-title">{post.title}</h2>
                    {post.excerpt && <p className="journal-excerpt">{post.excerpt}</p>}
                    <span className="journal-read">Read more ›</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <footer className="footer" style={{ marginTop: 60 }}>
            <div className="rule"></div>
            <div className="footer-links">
              <Link href="/journal">Journal</Link>
              <span className="footer-dot">·</span>
              <Link href="/terms">Terms</Link>
              <span className="footer-dot">·</span>
              <Link href="/privacy">Privacy</Link>
            </div>
            <p>© {new Date().getFullYear()} Kezia Kenova</p>
          </footer>
        </div>
      </main>
    </>
  );
}
