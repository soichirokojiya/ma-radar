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
          from: "M&Aレーダー <admin@ma-radar.jp>",
          to: buyer.email,
          subject: `【M&Aレーダー】新着案件: ${deal.title}`,
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <!-- ヘッダー -->
              <div style="background: linear-gradient(135deg, #1e3a8a, #3730a3); padding: 24px 32px; border-radius: 12px 12px 0 0;">
                <h1 style="color: #fff; font-size: 20px; margin: 0;">M&Aレーダー</h1>
                <p style="color: #93c5fd; font-size: 13px; margin: 6px 0 0;">新着案件のお知らせ</p>
              </div>

              <!-- 案件カード -->
              <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; overflow: hidden;">
                <div style="padding: 28px 32px;">
                  <h2 style="font-size: 18px; margin: 0 0 16px; color: #111;">${deal.title}</h2>

                  ${deal.summary ? `<p style="font-size: 14px; line-height: 1.7; color: #555; margin: 0 0 20px; padding: 16px; background: #f9fafb; border-radius: 8px;">${deal.summary}</p>` : ""}

                  <!-- 詳細テーブル -->
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                      <td style="padding: 10px 0; color: #6b7280; width: 140px;">業種</td>
                      <td style="padding: 10px 0; font-weight: 600;">${deal.industry}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                      <td style="padding: 10px 0; color: #6b7280;">エリア</td>
                      <td style="padding: 10px 0; font-weight: 600;">${deal.area}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                      <td style="padding: 10px 0; color: #6b7280;">譲渡希望価格</td>
                      <td style="padding: 10px 0; font-weight: 600;">${deal.price_range}</td>
                    </tr>
                    ${deal.revenue_scale ? `
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                      <td style="padding: 10px 0; color: #6b7280;">売上規模</td>
                      <td style="padding: 10px 0; font-weight: 600;">${deal.revenue_scale}</td>
                    </tr>` : ""}
                    ${deal.employee_scale ? `
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                      <td style="padding: 10px 0; color: #6b7280;">従業員規模</td>
                      <td style="padding: 10px 0; font-weight: 600;">${deal.employee_scale}</td>
                    </tr>` : ""}
                    ${deal.source_site ? `
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280;">掲載元</td>
                      <td style="padding: 10px 0; font-weight: 600;">${deal.source_site}</td>
                    </tr>` : ""}
                  </table>

                  <!-- CTAボタン -->
                  ${deal.source_url ? `
                  <div style="text-align: center; margin-top: 24px;">
                    <a href="${deal.source_url}" style="display: inline-block; background: #1e40af; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">案件の詳細を見る</a>
                  </div>` : ""}
                </div>

                <!-- フッター -->
                <div style="background: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
                    このメールはM&Aレーダーから自動送信されています。<br/>
                    配信停止をご希望の場合はこのメールにご返信ください。
                  </p>
                </div>
              </div>
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
