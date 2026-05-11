import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import BackButton from "@/components/BackButton";
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
            <BackButton href="/journal" label="All entries" />
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
            <p>© {new Date().getFullYear()} Kezia Kenova</p>
          </footer>
        </div>
      </main>
    </>
  );
}
