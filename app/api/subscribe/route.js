import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("subscribers")
      .insert({ email: email.toLowerCase().trim() });

    // Ignore duplicate errors (unique constraint) — treat as success
    if (error && !error.message.includes("duplicate")) {
      return NextResponse.json({ error: "failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
