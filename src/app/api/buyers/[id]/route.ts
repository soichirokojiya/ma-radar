import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { Resend } from "resend";
import { isMatch } from "@/lib/matching";
import { buildWelcomeEmail } from "@/lib/email-templates";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

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

// 買い手の希望条件を更新 + 初回はウェルカムメール送信
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();
  const body = await request.json();

  const { industries, areas, price_ranges, revenue_scales } = body;

  // 更新前のデータを取得（初回判定用）
  const { data: before } = await supabase
    .from("buyers")
    .select("*")
    .eq("id", id)
    .single();

  const isFirstTime =
    before &&
    (!before.industries?.length && !before.areas?.length && !before.price_ranges?.length);

  const { data, error } = await supabase
    .from("buyers")
    .update({ industries, areas, price_ranges, revenue_scales })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 初回の条件設定時 → ウェルカムメール（マッチする既存案件を最大5件）
  if (isFirstTime && data && (industries?.length || areas?.length || price_ranges?.length)) {
    try {
      const { data: allDeals } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      const matched = (allDeals || [])
        .filter((deal) => isMatch(deal, data))
        .slice(0, 5);

      if (matched.length > 0) {
        await getResend().emails.send({
          from: "M&Aレーダー <admin@ma-radar.jp>",
          to: data.email,
          subject: `【M&Aレーダー】条件にマッチする案件が${matched.length}件見つかりました`,
          html: buildWelcomeEmail(matched),
        });

        // 通知履歴を記録
        for (const deal of matched) {
          await supabase
            .from("notifications")
            .insert({ deal_id: deal.id, buyer_id: id, status: "sent" });
        }
      }
    } catch (e) {
      console.error("Welcome email error:", e);
    }
  }

  return NextResponse.json(data);
}
