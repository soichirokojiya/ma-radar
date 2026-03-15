import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { crawlMacloud } from "@/lib/crawlers/macloud";

// クロール実行（Cronまたは手動で呼び出し）
export async function POST(request: NextRequest) {
  // Cronシークレットで認証
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  try {
    // M&Aクラウドをクロール（最初の3ページ）
    const crawledDeals = await crawlMacloud(3);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const deal of crawledDeals) {
      // 重複チェック（external_idで判定）
      const { data: existing } = await supabase
        .from("deals")
        .select("id")
        .eq("external_id", deal.external_id)
        .single();

      if (existing) {
        skippedCount++;
        continue;
      }

      // DB に保存
      const { error } = await supabase.from("deals").insert({
        title: deal.title,
        industry: deal.industry,
        area: deal.area,
        price_range: deal.price_range,
        revenue_scale: deal.revenue_scale,
        summary: deal.summary,
        source_url: deal.source_url,
        source_site: deal.source_site,
        external_id: deal.external_id,
        is_manual: false,
      });

      if (error) {
        console.error(`Insert error for ${deal.external_id}:`, error.message);
      } else {
        insertedCount++;
      }
    }

    return NextResponse.json({
      message: `クロール完了: ${insertedCount}件追加, ${skippedCount}件スキップ`,
      total_crawled: crawledDeals.length,
      inserted: insertedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      { error: "クロール中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
