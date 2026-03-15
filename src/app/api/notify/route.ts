import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// 新着案件の通知を送信（Cronから呼び出し）
export async function POST(request: NextRequest) {
  // Cronシークレットで認証
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
    // 条件マッチング：業種・エリア・価格帯・売上規模
    // 条件未設定（空配列）の項目は全マッチ扱い
    const matchedBuyers = (buyers || []).filter((buyer) => {
      const industryMatch = !buyer.industries?.length || buyer.industries.includes(deal.industry);
      const areaMatch = !buyer.areas?.length || buyer.areas.includes(deal.area);
      const priceMatch = !buyer.price_ranges?.length || buyer.price_ranges.includes(deal.price_range);
      const revenueMatch = !buyer.revenue_scales?.length || !deal.revenue_scale || buyer.revenue_scales.includes(deal.revenue_scale);
      return industryMatch && areaMatch && priceMatch && revenueMatch;
    });

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
          from: "M&Aレーダー <noreply@ma-radar.jp>",
          to: buyer.email,
          subject: `【M&Aレーダー】新着案件: ${deal.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">新着M&A案件のお知らせ</h2>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
                <h3 style="margin-top: 0;">${deal.title}</h3>
                <p><strong>業種:</strong> ${deal.industry}</p>
                <p><strong>エリア:</strong> ${deal.area}</p>
                <p><strong>譲渡希望価格:</strong> ${deal.price_range}</p>
                ${deal.summary ? `<p>${deal.summary}</p>` : ""}
              </div>
              ${deal.source_url ? `<p><a href="${deal.source_url}" style="color: #1e40af;">案件の詳細を見る →</a></p>` : ""}
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #6b7280; font-size: 12px;">
                このメールはM&Aレーダーから自動送信されています。<br/>
                配信停止をご希望の場合はこのメールにご返信ください。
              </p>
            </div>
          `,
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
