import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// 買い手情報取得
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("buyers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }
  return NextResponse.json(data);
}

// 買い手の希望条件を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();
  const body = await request.json();

  const { industries, areas, price_ranges, revenue_scales } = body;

  const { data, error } = await supabase
    .from("buyers")
    .update({ industries, areas, price_ranges, revenue_scales })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
