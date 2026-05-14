// Server-side thumbnail fetcher — avoids CORS issues
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const platform = searchParams.get("platform");
  if (!url || !platform) return Response.json({ error: "Missing params" }, { status: 400 });

  try {
    let thumbUrl = null;

    if (platform === "tiktok") {
      const res = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; NextBot/1.0)" }, next: { revalidate: 86400 } }
      );
      if (res.ok) {
        const data = await res.json();
        thumbUrl = data.thumbnail_url || null;
      }

    } else if (platform === "instagram") {
      const clean = url.split(/[?#]/)[0].replace(/\/+$/, "");
      const m = clean.match(/\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
      if (m) {
        const shortcode = m[2];
        const embedRes = await fetch(
          `https://www.instagram.com/p/${shortcode}/embed/`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
            },
            cache: "no-store",
          }
        );

        if (embedRes.ok) {
          const html = await embedRes.text();

          // t51.71878 = Instagram video cover frame — lives in srcset, NOT src
          // Split srcset on commas, take last (highest res) entry
          const srcset1 = html.match(/srcset="([^"]*t51\.71878[^"]*)"/i);
          if (srcset1) {
            const entries = srcset1[1].split(",").map(function(s) { return s.trim(); }).filter(Boolean);
            const last = entries[entries.length - 1].split(/\s+/)[0];
            if (last) thumbUrl = last.replace(/&amp;/g, "&");
          }

          // t51.71878 in plain src= (sometimes present)
          if (!thumbUrl) {
            const src1 = html.match(/src="(https:\/\/scontent[^"]+t51\.71878[^"]+\.jpg[^"]*)"/);
            if (src1) thumbUrl = src1[1].replace(/&amp;/g, "&");
          }

          // t51.2885-15 in srcset (standard post image)
          if (!thumbUrl) {
            const srcset2 = html.match(/srcset="([^"]*t51\.2885-15[^"]*)"/i);
            if (srcset2) {
              const entries = srcset2[1].split(",").map(function(s) { return s.trim(); }).filter(Boolean);
              const last = entries[entries.length - 1].split(/\s+/)[0];
              if (last) thumbUrl = last.replace(/&amp;/g, "&");
            }
          }

          // og:image meta tag — final fallback
          if (!thumbUrl) {
            const og =
              html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
              html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
            if (og) thumbUrl = og[1].replace(/&amp;/g, "&");
          }
        }
      }
    }

    return Response.json({ thumbnail_url: thumbUrl });
  } catch {
    return Response.json({ thumbnail_url: null });
  }
}
