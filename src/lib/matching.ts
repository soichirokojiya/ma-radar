// 案件と買い手の条件マッチング
// 条件未設定（空配列）の項目 → 全マッチ扱い
// 案件側が「未公開」の項目 → 全マッチ扱い
// マッチング対象: 業種 + エリア + 売却価格の3条件
export function isMatch(
  deal: { industry: string; area: string; price_range: string },
  buyer: { industries: string[]; areas: string[]; price_ranges: string[] }
): boolean {
  const industryMatch =
    !buyer.industries?.length || buyer.industries.includes(deal.industry);
  const areaMatch =
    !buyer.areas?.length || buyer.areas.includes(deal.area);
  const priceMatch =
    !buyer.price_ranges?.length ||
    deal.price_range === "未公開" ||
    buyer.price_ranges.includes(deal.price_range);

  return industryMatch && areaMatch && priceMatch;
}
