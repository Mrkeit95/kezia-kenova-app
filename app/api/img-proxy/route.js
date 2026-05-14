// Instagram thumbnail proxy — accepts either:
//   ?shortcode=ABC123  → scrapes fresh CDN URL then proxies the image
//   ?url=https://...   → proxies an existing CDN URL directly
// Instagram CDN URLs expire, so we always scrape fresh when given a shortcode.

async function fetchFreshCdnUrl(shortcode) {
  const embedRes = await fetch(
    `https://www.instagram.com/p/${shortcode}/embed/`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.5",
      },
      cache: "no-store",
    }
  );
  if (!embedRes.ok) return null;
  const html = await embedRes.text();

  // t51.71878 = video cover frame, lives in srcset
  const srcset1 = html.match(/srcset="([^"]*t51\.71878[^"]*)"/i);
  if (srcset1) {
    const entries = srcset1[1].split(",").map((s) => s.trim()).filter(Boolean);
    const last = entries[entries.length - 1].split(/\s+/)[0];
    if (last) return last.replace(/&amp;/g, "&");
  }

  // t51.2885-15 in srcset (standard post image)
  const srcset2 = html.match(/srcset="([^"]*t51\.2885-15[^"]*)"/i);
  if (srcset2) {
    const entries = srcset2[1].split(",").map((s) => s.trim()).filter(Boolean);
    const last = entries[entries.length - 1].split(/\s+/)[0];
    if (last) return last.replace(/&amp;/g, "&");
  }

  // og:image fallback
  const og =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (og) return og[1].replace(/&amp;/g, "&");

  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shortcode = searchParams.get("shortcode");
  const rawUrl = searchParams.get("url");

  if (!shortcode && !rawUrl) return new Response("Missing params", { status: 400 });

  try {
    let cdnUrl = rawUrl ? decodeURIComponent(rawUrl) : null;

    // If given a shortcode, always scrape a fresh CDN URL
    if (shortcode) {
      cdnUrl = await fetchFreshCdnUrl(shortcode);
      if (!cdnUrl) return new Response("Could not fetch thumbnail", { status: 404 });
    }

    const res = await fetch(cdnUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        "Referer": "https://www.instagram.com/",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      // If direct URL failed (expired), and we have a shortcode embedded in it, retry fresh
      const scMatch = cdnUrl && cdnUrl.match(/\/([A-Za-z0-9_-]{10,})_/);
      return new Response("Fetch failed", { status: 502 });
    }
    const buf = await res.arrayBuffer();
    const ct = res.headers.get("content-type") || "image/jpeg";
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": ct,
        // Cache for 1 hour on the CDN, but revalidate
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Error", { status: 500 });
  }
}
