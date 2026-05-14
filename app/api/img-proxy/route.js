// Proxies Instagram CDN images — their signed URLs expire, this re-fetches fresh
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  try {
    const res = await fetch(decodeURIComponent(url), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        "Referer": "https://www.instagram.com/",
      },
      cache: "no-store",
    });
    if (!res.ok) return new Response("Fetch failed", { status: 502 });
    const buf = await res.arrayBuffer();
    const ct = res.headers.get("content-type") || "image/jpeg";
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Error", { status: 500 });
  }
}
