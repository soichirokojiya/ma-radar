import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { Resend } from "resend";
import { isMatch } from "@/lib/matching";
import { buildNewDealEmail } from "@/lib/email-templates";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// 新着案件の通知を送信（Cronから呼び出し）
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // 未通知の案件を取得
  const { data: deals, error: dealsError } = await supabase
    .from("deals")
    .select("*")
    .eq("notified", false);

  if (dealsError) {
    return NextResponse.json({ error: dealsError.message }, { status: 500 });
  }

  if (!deals || deals.length === 0) {
    return NextResponse.json({ message: "通知対象の案件はありません" });
  }

  // アクティブな買い手を取得
  const { data: buyers, error: buyersError } = await supabase
    .from("buyers")
    .select("*")
    .eq("is_active", true);

  if (buyersError) {
    return NextResponse.json({ error: buyersError.message }, { status: 500 });
  }

  let sentCount = 0;

  for (const deal of deals) {
    const matchedBuyers = (buyers || []).filter((buyer) => isMatch(deal, buyer));

    for (const buyer of matchedBuyers) {
      // 既に通知済みか確認
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("deal_id", deal.id)
        .eq("buyer_id", buyer.id)
        .single();

      if (existing) continue;

      try {
        await getResend().emails.send({
          from: "M&Aレーダー <admin@ma-radar.jp>",
          to: buyer.email,
          subject: `【M&Aレーダー】新着案件: ${deal.title}`,
          html: buildNewDealEmail(deal),
        });

        await supabase
          .from("notifications")
          .insert({ deal_id: deal.id, buyer_id: buyer.id, status: "sent" });

        sentCount++;
      } catch {
        await supabase
          .from("notifications")
          .insert({ deal_id: deal.id, buyer_id: buyer.id, status: "failed" });
      }
    }

    // 案件を通知済みに更新
    await supabase.from("deals").update({ notified: true }).eq("id", deal.id);
  }

  return NextResponse.json({ message: `${sentCount}件のメールを送信しました` });
}
