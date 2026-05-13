// Server-side oEmbed thumbnail fetcher — avoids CORS issues
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const platform = searchParams.get("platform");
  if (!url || !platform) return Response.json({ error: "Missing params" }, { status: 400 });

  try {
    let thumbUrl = null;

    if (platform === "tiktok") {
      // TikTok oEmbed
      const res = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
        { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 86400 } }
      );
      if (res.ok) {
        const data = await res.json();
        thumbUrl = data.thumbnail_url || null;
      }
    } else if (platform === "instagram") {
      // Instagram oEmbed (public, no auth needed for public posts)
      const res = await fetch(
        `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&fields=thumbnail_url&access_token=public`,
        { next: { revalidate: 86400 } }
      );
      // FB oembed requires token — fallback: use instagram.com/p/{id}/media
      if (!res.ok) {
        // Extract ID and use the embed thumbnail trick
        const clean = url.split(/[?#]/)[0].replace(/\/+$/, "");
        const m = clean.match(/\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
        if (m) {
          // Instagram doesn't allow direct thumbnail without auth
          // Return null — we'll show the embed placeholder
          thumbUrl = null;
        }
      } else {
        const data = await res.json();
        thumbUrl = data.thumbnail_url || null;
      }
    }

    return Response.json({ thumbnail_url: thumbUrl });
  } catch (e) {
    return Response.json({ thumbnail_url: null });
  }
}
