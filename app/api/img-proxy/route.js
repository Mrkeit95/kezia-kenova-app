export const runtime = "nodejs";

async function scrapeIgThumb(shortcode) {
  const r = await fetch(`https://www.instagram.com/p/${shortcode}/embed/`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.5",
    },
    cache: "no-store",
  });
  if (!r.ok) return null;
  const html = await r.text();
  // Video cover frame lives in srcset — grab the highest-res entry
  const ss = html.match(/srcset="([^"]*t51\.71878[^"]*)"/i);
  if (ss) {
    const parts = ss[1].split(",").map(s => s.trim()).filter(Boolean);
    const u = parts[parts.length - 1].split(/\s+/)[0];
    if (u) return u.replace(/&amp;/g, "&");
  }
  const ss2 = html.match(/srcset="([^"]*t51\.2885-15[^"]*)"/i);
  if (ss2) {
    const parts = ss2[1].split(",").map(s => s.trim()).filter(Boolean);
    const u = parts[parts.length - 1].split(/\s+/)[0];
    if (u) return u.replace(/&amp;/g, "&");
  }
  // lookaside SEO image — always fresh, never expires
  const la = html.match(/src="(https:\/\/lookaside\.instagram\.com\/seo\/[^"]+)"/);
  if (la) return la[1].replace(/&amp;/g, "&");
  // og:image last resort
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (og) return og[1].replace(/&amp;/g, "&");
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shortcode = searchParams.get("shortcode");
  const rawUrl = searchParams.get("url");

  if (!shortcode && !rawUrl) {
    return new Response("Missing params", { status: 400 });
  }

  try {
    let cdnUrl = rawUrl ? decodeURIComponent(rawUrl) : null;

    if (shortcode) {
      cdnUrl = await scrapeIgThumb(shortcode);
      if (!cdnUrl) return new Response("No thumbnail found", { status: 404 });
    }

    const imgRes = await fetch(cdnUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        "Referer": "https://www.instagram.com/",
      },
      cache: "no-store",
    });
    if (!imgRes.ok) return new Response("CDN fetch failed", { status: 502 });

    const buf = await imgRes.arrayBuffer();
    const ct = imgRes.headers.get("content-type") || "image/jpeg";
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    return new Response("Error: " + e.message, { status: 500 });
  }
}
