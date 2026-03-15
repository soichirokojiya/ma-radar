import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// 買い手登録（メールアドレスのみ）
export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();

  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "メールアドレスを入力してください" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("buyers")
    .insert({ email })
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
