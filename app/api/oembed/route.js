// Server-side thumbnail fetcher — avoids CORS issues
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const platform = searchParams.get("platform");
  if (!url || !platform) return Response.json({ error: "Missing params" }, { status: 400 });

  try {
    let thumbUrl = null;

    if (platform === "tiktok") {
      // TikTok oEmbed — returns thumbnail_url reliably
      const res = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; NextBot/1.0)" }, next: { revalidate: 86400 } }
      );
      if (res.ok) {
        const data = await res.json();
        thumbUrl = data.thumbnail_url || null;
      }
    } else if (platform === "instagram") {
      // Instagram: scrape the public embed page — no auth needed for public posts
      const clean = url.split(/[?#]/)[0].replace(/\/+$/, "");
      const m = clean.match(/\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
      if (m) {
        const shortcode = m[2];
        const embedRes = await fetch(
          "https://www.instagram.com/p/" + shortcode + "/embed/",
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
              "Accept": "text/html",
            },
            next: { revalidate: 86400 },
          }
        );
        if (embedRes.ok) {
          const html = await embedRes.text();

          // 1. Try EmbeddedMediaImage src (most reliable — present in embed page HTML)
          const embeddedImgMatch = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/) ||
            html.match(/src="([^"]+)"[^>]*class="EmbeddedMediaImage"/);
          if (embeddedImgMatch) {
            thumbUrl = embeddedImgMatch[1].replace(/&amp;/g, "&");
          }

          // 2. Fallback: lookaside.instagram.com/seo URL embedded in the img tag
          if (!thumbUrl) {
            const lookasideMatch = html.match(/src="(https:\/\/lookaside\.instagram\.com\/seo\/[^"]+)"/);
            if (lookasideMatch) {
              thumbUrl = lookasideMatch[1].replace(/&amp;/g, "&");
            }
          }

          // 3. Fallback: og:image meta tag
          if (!thumbUrl) {
            const ogMatch =
              html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
              html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
            if (ogMatch) thumbUrl = ogMatch[1].replace(/&amp;/g, "&");
          }

          // 4. Fallback: display_url in inline JSON
          if (!thumbUrl) {
            const imgMatch = html.match(/"display_url":"([^"]+)"/);
            if (imgMatch) {
              try { thumbUrl = JSON.parse('"' + imgMatch[1] + '"'); } catch { thumbUrl = null; }
            }
          }
        }
      }
    }

    return Response.json({ thumbnail_url: thumbUrl });
  } catch {
    return Response.json({ thumbnail_url: null });
  }
}
