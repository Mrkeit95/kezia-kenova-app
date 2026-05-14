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
      // Scrape Instagram's public embed page — no auth needed for public posts
      const clean = url.split(/[?#]/)[0].replace(/\/+$/, "");
      const m = clean.match(/\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
      if (m) {
        const shortcode = m[2];

        // Try multiple embed URL formats
        const embedUrls = [
          `https://www.instagram.com/p/${shortcode}/embed/`,
          `https://www.instagram.com/reel/${shortcode}/embed/`,
        ];

        for (const embedUrl of embedUrls) {
          if (thumbUrl) break;
          const embedRes = await fetch(embedUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
            },
            cache: "no-store",
          });

          if (!embedRes.ok) continue;
          const html = await embedRes.text();

          // 1. Any scontent CDN image that is NOT the profile picture (t51.82787)
          const cdnMatch =
            html.match(/src="(https:\/\/scontent[^"]+t51\.71878[^"]+\.jpg[^"]*)"/)
            || html.match(/src="(https:\/\/scontent[^"]+t51\.2885-15[^"]+\.jpg[^"]*)"/)
            || html.match(/src="(https:\/\/scontent[^"]+(?:(?!t51\.82787)[^"]+)\.jpg[^"]*)"/);
          if (cdnMatch) { thumbUrl = cdnMatch[1].replace(/&amp;/g, "&"); break; }

          // 2. display_url inside JSON blob
          const displayMatch = html.match(/["']display_url["']:\s*["']([^"']+)["']/);
          if (displayMatch) {
            try { thumbUrl = JSON.parse('"' + displayMatch[1] + '"'); break; } catch {}
          }

          // 3. image_versions inside JSON blob
          const ivMatch = html.match(/["']url["']:\s*["'](https:\/\/scontent[^"']+\.jpg[^"']*)["']/);
          if (ivMatch) { thumbUrl = ivMatch[1].replace(/&amp;/g, "&"); break; }

          // 4. og:image meta tag
          const ogMatch =
            html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
          if (ogMatch) { thumbUrl = ogMatch[1].replace(/&amp;/g, "&"); break; }
        }
      }
    }

    return Response.json({ thumbnail_url: thumbUrl });
  } catch {
    return Response.json({ thumbnail_url: null });
  }
}
