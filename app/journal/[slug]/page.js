import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import "../../globals.css";
import "../../home.css";
import "../journal.css";

export async function generateMetadata({ params }) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("journal_posts")
    .select("title, excerpt")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  return {
    title: post ? `${post.title} · Kezia Kenova` : "Journal · Kezia Kenova",
    description: post?.excerpt,
  };
}

export default async function JournalPost({ params }) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("journal_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="journal-post-shell">
          <div className="detail-nav">
            <Link href="/journal" className="detail-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>All entries</span>
            </Link>
          </div>

          <article className="journal-article">
            <div className="journal-post-date">
              {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <h1 className="journal-post-title">{post.title}</h1>
            {post.excerpt && <p className="journal-post-excerpt">{post.excerpt}</p>}

            {post.cover_image && (
              <div className="journal-post-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.cover_image} alt={post.title} />
              </div>
            )}

            <div className="journal-post-content">
              {(post.content || "").split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </article>

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
