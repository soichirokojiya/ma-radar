import * as cheerio from "cheerio";

export type CrawledDeal = {
  title: string;
  industry: string;
  area: string;
  price_range: string;
  revenue_scale: string;
  summary: string;
  source_url: string;
  source_site: string;
  external_id: string;
};

// macloud.jpの案件一覧ページをクロール
export async function crawlMacloud(pages: number = 3): Promise<CrawledDeal[]> {
  const deals: CrawledDeal[] = [];

  for (let page = 1; page <= pages; page++) {
    const url = `https://macloud.jp/selling_targets?page=${page}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch page ${page}: ${res.status}`);
      continue;
    }

    const html = await res.text();
    const parsed = parseMacloudPage(html);
    deals.push(...parsed);

    // レート制限対策: 1秒待つ
    if (page < pages) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return deals;
}

function parseMacloudPage(html: string): CrawledDeal[] {
  const $ = cheerio.load(html);
  const deals: CrawledDeal[] = [];

  // 各案件カードを取得（aタグでselling_targetsへのリンクを持つカード）
  $('a[href*="/selling_targets/"]').each((_, el) => {
    const $card = $(el);
    const href = $card.attr("href") || "";

    // 案件IDを抽出
    const idMatch = href.match(/\/selling_targets\/(\d+)/);
    if (!idMatch) return;

    const externalId = `macloud_${idMatch[1]}`;
    const sourceUrl = `https://macloud.jp/selling_targets/${idMatch[1]}`;

    // カード内のテキストを取得
    const cardText = $card.text();

    // タイトルを抽出（最も長いテキストブロックを探す）
    let title = "";
    $card.find("*").each((_, child) => {
      const text = $(child).clone().children().remove().end().text().trim();
      if (text.length > title.length && text.length > 10 && text.length < 200) {
        // 明らかにタイトルでない文字列を除外
        if (
          !text.match(/^(純資産|前期|今期|公開日|ID|会社売却|事業売却|新着|人気)/) &&
          !text.match(/^\d/) &&
          !text.match(/^[〜△]/) &&
          !text.match(/万円/) &&
          !text.match(/^(北海道|東北|関東|中部|近畿|中国|四国|九州)/)
        ) {
          title = text;
        }
      }
    });

    if (!title) return;

    // エリアを抽出
    const area = extractArea(cardText);

    // 業種を抽出
    const industry = extractIndustry(cardText);

    // 売上規模を抽出
    const revenueScale = extractRevenue(cardText);

    deals.push({
      title,
      industry,
      area,
      price_range: "未公開",
      revenue_scale: revenueScale,
      summary: title.slice(0, 100),
      source_url: sourceUrl,
      source_site: "M&Aクラウド",
      external_id: externalId,
    });
  });

  // 重複除去（同じexternal_idのもの）
  const unique = new Map<string, CrawledDeal>();
  for (const deal of deals) {
    if (!unique.has(deal.external_id)) {
      unique.set(deal.external_id, deal);
    }
  }

  return Array.from(unique.values());
}

function extractArea(text: string): string {
  const areas = [
    "北海道",
    "東北",
    "関東",
    "中部",
    "近畿",
    "中国地方",
    "四国",
    "九州・沖縄",
    "海外",
  ];
  for (const area of areas) {
    if (text.includes(area)) {
      // 定数と合わせる
      if (area === "中国地方") return "中国";
      return area;
    }
  }
  return "全国対応";
}

function extractIndustry(text: string): string {
  const industryMap: Record<string, string> = {
    IT: "IT・通信",
    SaaS: "IT・通信",
    アプリ開発: "IT・通信",
    "システム・インテグレーション": "IT・通信",
    飲食店: "飲食業",
    飲食: "飲食業",
    食品: "飲食業",
    小売: "小売業",
    EC: "小売業",
    製造業: "製造業",
    工場: "製造業",
    建築: "建設・不動産",
    建設: "建設・不動産",
    不動産: "建設・不動産",
    医療: "医療・介護",
    介護: "医療・介護",
    病院: "医療・介護",
    クリニック: "医療・介護",
    調剤薬局: "医療・介護",
    美容: "美容・サロン",
    フィットネス: "美容・サロン",
    教育: "教育・学習塾",
    学習塾: "教育・学習塾",
    物流: "物流・運送",
    ホテル: "宿泊・観光",
    旅館: "宿泊・観光",
    観光: "宿泊・観光",
    農業: "農林水産業",
    金融: "金融・保険",
    保険: "金融・保険",
    人材: "人材・派遣",
  };

  for (const [keyword, industry] of Object.entries(industryMap)) {
    if (text.includes(keyword)) {
      return industry;
    }
  }
  return "その他サービス";
}

function extractRevenue(text: string): string {
  // 前期売上の値を抽出
  const patterns = [
    { match: /前期売上.*?(\d+)億/, min: 100000 },
    { match: /前期売上.*?(\d[\d,]*)万円.*?(\d[\d,]*)万円/, range: true },
  ];

  // テキストから売上レンジを特定
  if (text.includes("前期売上")) {
    if (text.match(/3億円/)) return "3億円〜";
    if (text.match(/1億円.*?3億円/) || text.match(/1億円〜/)) return "1億〜3億円";
    if (text.match(/5,000万円.*?1億円/) || text.match(/5,000万.*?1億/))
      return "5,000万〜1億円";
    if (text.match(/3,000万円.*?5,000万円/) || text.match(/3,000万.*?5,000万/))
      return "3,000万〜5,000万円";
    if (text.match(/1,000万円.*?3,000万円/) || text.match(/1,000万.*?3,000万/))
      return "1,000万〜3,000万円";
  }
  return "〜1,000万円";
}
