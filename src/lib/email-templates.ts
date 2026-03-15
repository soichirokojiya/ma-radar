type Deal = {
  title: string;
  industry: string;
  area: string;
  price_range: string;
  revenue_scale?: string | null;
  employee_scale?: string | null;
  summary?: string | null;
  source_url?: string | null;
  source_site?: string | null;
};

function dealCardHtml(deal: Deal): string {
  return `
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
      <div style="padding: 20px 24px;">
        <h3 style="font-size: 16px; margin: 0 0 12px; color: #111;">${deal.title}</h3>
        ${deal.summary ? `<p style="font-size: 13px; line-height: 1.6; color: #555; margin: 0 0 16px; padding: 12px; background: #f9fafb; border-radius: 6px;">${deal.summary}</p>` : ""}
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">業種</td>
            <td style="padding: 8px 0; font-weight: 600;">${deal.industry}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px 0; color: #6b7280;">エリア</td>
            <td style="padding: 8px 0; font-weight: 600;">${deal.area}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px 0; color: #6b7280;">譲渡希望価格</td>
            <td style="padding: 8px 0; font-weight: 600;">${deal.price_range}</td>
          </tr>
          ${deal.revenue_scale ? `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px 0; color: #6b7280;">売上規模</td>
            <td style="padding: 8px 0; font-weight: 600;">${deal.revenue_scale}</td>
          </tr>` : ""}
          ${deal.employee_scale ? `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px 0; color: #6b7280;">従業員規模</td>
            <td style="padding: 8px 0; font-weight: 600;">${deal.employee_scale}</td>
          </tr>` : ""}
          ${deal.source_site ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">掲載元</td>
            <td style="padding: 8px 0; font-weight: 600;">${deal.source_site}</td>
          </tr>` : ""}
        </table>
        ${deal.source_url ? `
        <div style="text-align: center; margin-top: 16px;">
          <a href="${deal.source_url}" style="display: inline-block; background: #1e40af; color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 13px;">詳細を見る</a>
        </div>` : ""}
      </div>
    </div>`;
}

function wrapEmail(headerSubtitle: string, body: string): string {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #3730a3); padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; font-size: 20px; margin: 0;">M&Aレーダー</h1>
        <p style="color: #93c5fd; font-size: 13px; margin: 6px 0 0;">${headerSubtitle}</p>
      </div>
      <div style="padding: 28px 32px; border: 1px solid #e5e7eb; border-top: none;">
        ${body}
      </div>
      <div style="background: #f9fafb; padding: 20px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
          このメールはM&Aレーダーから自動送信されています。<br/>
          配信停止をご希望の場合はこのメールにご返信ください。
        </p>
      </div>
    </div>`;
}

// 新着案件の個別通知メール
export function buildNewDealEmail(deal: Deal): string {
  return wrapEmail("新着案件のお知らせ", dealCardHtml(deal));
}

// 初回ウェルカムメール（最大5件のダイジェスト）
export function buildWelcomeEmail(deals: Deal[]): string {
  const intro = `
    <p style="font-size: 15px; margin: 0 0 8px;">ご登録ありがとうございます！</p>
    <p style="font-size: 14px; color: #555; margin: 0 0 24px; line-height: 1.7;">
      あなたの希望条件にマッチする案件が <strong>${deals.length}件</strong> 見つかりました。<br/>
      今後も新着案件が見つかり次第、メールでお届けします。
    </p>`;

  const cards = deals.map((d) => dealCardHtml(d)).join("");

  return wrapEmail(
    "ようこそ！条件にマッチする案件をお届けします",
    intro + cards
  );
}
