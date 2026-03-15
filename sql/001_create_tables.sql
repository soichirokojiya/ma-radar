-- M&Aレーダー テーブル定義

-- 案件テーブル
create table if not exists deals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  industry text not null,        -- 業種
  area text not null,             -- エリア
  price_range text not null,      -- 譲渡希望価格帯
  employee_scale text,            -- 従業員規模
  summary text,                   -- 概要（100字程度）
  source_url text,                -- 元サイトURL
  source_site text,               -- 取得元サイト名（バトンズ/トランビ等）
  is_manual boolean default false,-- 手動登録かどうか
  external_id text unique,        -- 外部サイトの案件ID（重複チェック用）
  notified boolean default false, -- 通知済みフラグ
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 買い手テーブル
create table if not exists buyers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  industries text[] not null,     -- 希望業種（複数選択可）
  areas text[] not null,          -- 希望エリア（複数選択可）
  price_ranges text[] not null,   -- 希望価格帯（複数選択可）
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 通知履歴テーブル
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade,
  buyer_id uuid references buyers(id) on delete cascade,
  sent_at timestamptz default now(),
  status text default 'sent'      -- sent / failed
);

-- インデックス
create index if not exists idx_deals_industry on deals(industry);
create index if not exists idx_deals_area on deals(area);
create index if not exists idx_deals_price_range on deals(price_range);
create index if not exists idx_deals_notified on deals(notified);
create index if not exists idx_buyers_is_active on buyers(is_active);
create index if not exists idx_notifications_deal_id on notifications(deal_id);
create index if not exists idx_notifications_buyer_id on notifications(buyer_id);

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger deals_updated_at
  before update on deals
  for each row execute function update_updated_at();

create trigger buyers_updated_at
  before update on buyers
  for each row execute function update_updated_at();
