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
      // Instagram oEmbed API — works for public posts without auth
      const oEmbedRes = await fetch(
        `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&maxwidth=320`,
        {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; NextBot/1.0)" },
          cache: "no-store",
        }
      );
      if (oEmbedRes.ok) {
        const data = await oEmbedRes.json();
        thumbUrl = data.thumbnail_url || null;
      }

      // Fallback: scrape the public embed page if oEmbed didn't work
      if (!thumbUrl) {
        const clean = url.split(/[?#]/)[0].replace(/\/+$/, "");
        const m = clean.match(/\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
        if (m) {
          const shortcode = m[2];
          const embedRes = await fetch(
            "https://www.instagram.com/p/" + shortcode + "/embed/captioned/",
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
              },
              cache: "no-store",
            }
          );
          if (embedRes.ok) {
            const html = await embedRes.text();

            // 1. Video frame thumbnail (t51.71878) or post image (t51.2885-15)
            const videoFrameMatch =
              html.match(/src="(https:\/\/scontent[^"]+t51\.71878[^"]+\.jpg[^"]*)"/)
              || html.match(/src="(https:\/\/scontent[^"]+t51\.2885-15[^"]+\.jpg[^"]*)"/)
              || html.match(/src="(https:\/\/scontent[^"]+t51\.(?!82787)[^"]+\.jpg[^"]*)"/);
            if (videoFrameMatch) {
              thumbUrl = videoFrameMatch[1].replace(/&amp;/g, "&");
            }

            // 2. Fallback: lookaside.instagram.com/seo
            if (!thumbUrl) {
              const lookasideMatch = html.match(/src="(https:\/\/lookaside\.instagram\.com\/seo\/[^"]+)"/);
              if (lookasideMatch) thumbUrl = lookasideMatch[1].replace(/&amp;/g, "&");
            }

            // 3. Fallback: og:image meta
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
    }

    return Response.json({ thumbnail_url: thumbUrl });
  } catch {
    return Response.json({ thumbnail_url: null });
  }
}
