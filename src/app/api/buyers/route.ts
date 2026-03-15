import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// 買い手登録
export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();

  const { name, email, industries, areas, price_ranges } = body;

  if (!name || !email || !industries?.length || !areas?.length || !price_ranges?.length) {
    return NextResponse.json(
      { error: "必須項目が入力されていません" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("buyers")
    .insert({ name, email, industries, areas, price_ranges })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
