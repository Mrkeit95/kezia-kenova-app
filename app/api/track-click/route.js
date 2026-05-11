import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { product_id } = await request.json();
    if (!product_id) return NextResponse.json({ error: "missing product_id" }, { status: 400 });

    const supabase = createClient();
    await supabase.from("clicks").insert({ product_id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
