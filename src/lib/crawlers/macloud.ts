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

// macloud.jpのAPIから案件を取得
export async function crawlMacloud(pages: number = 3): Promise<CrawledDeal[]> {
  const deals: CrawledDeal[] = [];

  for (let page = 1; page <= pages; page++) {
    // macloud.jpの内部APIを試行
    const url = `https://macloud.jp/api/selling_targets?page=${page}`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        // APIがなければHTML版にフォールバック
        const htmlDeals = await crawlMacloudHtml(page);
        deals.push(...htmlDeals);
        continue;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("json")) {
        const htmlDeals = await crawlMacloudHtml(page);
        deals.push(...htmlDeals);
        continue;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const deal = parseApiItem(item);
          if (deal) deals.push(deal);
        }
      } else if (data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
          const deal = parseApiItem(item);
          if (deal) deals.push(deal);
        }
      } else if (data.selling_targets && Array.isArray(data.selling_targets)) {
        for (const item of data.selling_targets) {
          const deal = parseApiItem(item);
          if (deal) deals.push(deal);
        }
      }
    } catch {
      const htmlDeals = await crawlMacloudHtml(page);
      deals.push(...htmlDeals);
    }

    if (page < pages) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return deals;
}

function parseApiItem(item: Record<string, unknown>): CrawledDeal | null {
  const id = item.id || item.selling_target_id;
  if (!id) return null;

  const title = String(item.title || item.name || "");
  if (!title) return null;

  return {
    title,
    industry: mapIndustry(String(item.industry || item.category || "")),
    area: mapArea(String(item.area || item.region || item.prefecture || "")),
    price_range: "未公開",
    revenue_scale: mapRevenue(String(item.revenue || item.sales || "")),
    summary: String(item.summary || item.description || title).slice(0, 100),
    source_url: `https://macloud.jp/selling_targets/${id}`,
    source_site: "M&Aクラウド",
    external_id: `macloud_${id}`,
  };
}

// HTMLページからテキストベースで案件を抽出
async function crawlMacloudHtml(page: number): Promise<CrawledDeal[]> {
  const url = `https://macloud.jp/selling_targets?page=${page}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });

  if (!res.ok) return [];

  const html = await res.text();
  const deals: CrawledDeal[] = [];

  // selling_targets/数字 のパターンで案件IDを抽出
  const idPattern = /\/selling_targets\/(\d+)/g;
  const foundIds = new Set<string>();
  let match;

  while ((match = idPattern.exec(html)) !== null) {
    foundIds.add(match[1]);
  }

  // 各案件IDに対してテキストから情報を推定
  for (const id of foundIds) {
    // 案件詳細ページから情報を取得
    try {
      const detail = await fetchDealDetail(id);
      if (detail) {
        deals.push(detail);
      }
    } catch {
      // 詳細取得失敗時はスキップ
    }
    // レート制限
    await new Promise((r) => setTimeout(r, 500));
  }

  return deals;
}

// 案件詳細ページから情報を取得
async function fetchDealDetail(id: string): Promise<CrawledDeal | null> {
  const url = `https://macloud.jp/selling_targets/${id}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });

  if (!res.ok) return null;

  const html = await res.text();

  // titleタグからタイトルを取得
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].replace(/\s*[|\-–].*/g, "").trim() : "";
  if (!title || title.length < 5) return null;

  // メタディスクリプションから概要を取得
  const descMatch = html.match(
    /meta\s+(?:name="description"\s+content="([^"]*)")|(?:content="([^"]*)"\s+name="description")/i
  );
  const summary = descMatch ? (descMatch[1] || descMatch[2] || "").slice(0, 100) : title.slice(0, 100);

  // テキストから情報を推定
  const industry = extractIndustryFromText(html);
  const area = extractAreaFromText(html);
  const revenue = extractRevenueFromText(html);

  return {
    title,
    industry,
    area,
    price_range: "未公開",
    revenue_scale: revenue,
    summary,
    source_url: url,
    source_site: "M&Aクラウド",
    external_id: `macloud_${id}`,
  };
}

function extractIndustryFromText(text: string): string {
  const industryMap: Record<string, string> = {
    飲食: "飲食業",
    食品: "飲食業",
    レストラン: "飲食業",
    居酒屋: "飲食業",
    カフェ: "飲食業",
    小売: "小売業",
    EC: "小売業",
    IT: "IT・通信",
    SaaS: "IT・通信",
    アプリ: "IT・通信",
    システム: "IT・通信",
    通信: "IT・通信",
    製造: "製造業",
    工場: "製造業",
    建築: "建設・不動産",
    建設: "建設・不動産",
    不動産: "建設・不動産",
    医療: "医療・介護",
    介護: "医療・介護",
    福祉: "医療・介護",
    病院: "医療・介護",
    クリニック: "医療・介護",
    薬局: "医療・介護",
    美容: "美容・サロン",
    サロン: "美容・サロン",
    フィットネス: "美容・サロン",
    教育: "教育・学習塾",
    学習塾: "教育・学習塾",
    物流: "物流・運送",
    運送: "物流・運送",
    ホテル: "宿泊・観光",
    旅館: "宿泊・観光",
    観光: "宿泊・観光",
    農業: "農林水産業",
    金融: "金融・保険",
    保険: "金融・保険",
    人材: "人材・派遣",
    派遣: "人材・派遣",
  };

  for (const [keyword, industry] of Object.entries(industryMap)) {
    if (text.includes(keyword)) return industry;
  }
  return "その他サービス";
}

function extractAreaFromText(text: string): string {
  const areas: [string, string][] = [
    ["北海道", "北海道"],
    ["東北", "東北"],
    ["東京", "関東"],
    ["神奈川", "関東"],
    ["千葉", "関東"],
    ["埼玉", "関東"],
    ["関東", "関東"],
    ["愛知", "中部"],
    ["名古屋", "中部"],
    ["中部", "中部"],
    ["大阪", "近畿"],
    ["京都", "近畿"],
    ["兵庫", "近畿"],
    ["近畿", "近畿"],
    ["関西", "近畿"],
    ["広島", "中国"],
    ["岡山", "中国"],
    ["中国地方", "中国"],
    ["四国", "四国"],
    ["福岡", "九州・沖縄"],
    ["沖縄", "九州・沖縄"],
    ["九州", "九州・沖縄"],
  ];

  for (const [keyword, area] of areas) {
    if (text.includes(keyword)) return area;
  }
  return "全国対応";
}

function extractRevenueFromText(text: string): string {
  if (text.includes("3億円")) return "3億円〜";
  if (text.match(/1億.*3億/) || text.includes("1億円〜")) return "1億〜3億円";
  if (text.match(/5,000万.*1億/) || text.match(/5000万.*1億/)) return "5,000万〜1億円";
  if (text.match(/3,000万.*5,000万/) || text.match(/3000万.*5000万/)) return "3,000万〜5,000万円";
  if (text.match(/1,000万.*3,000万/) || text.match(/1000万.*3000万/)) return "1,000万〜3,000万円";
  return "〜1,000万円";
}

function mapIndustry(raw: string): string {
  return extractIndustryFromText(raw);
}

function mapArea(raw: string): string {
  return extractAreaFromText(raw);
}

function mapRevenue(raw: string): string {
  return extractRevenueFromText(raw);
}
