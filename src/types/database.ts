export type Deal = {
  id: string;
  title: string;
  industry: string;
  area: string;
  price_range: string;
  revenue_scale: string | null;
  employee_scale: string | null;
  summary: string | null;
  source_url: string | null;
  source_site: string | null;
  is_manual: boolean;
  external_id: string | null;
  notified: boolean;
  created_at: string;
  updated_at: string;
};

export type Buyer = {
  id: string;
  name: string;
  email: string;
  industries: string[];
  areas: string[];
  price_ranges: string[];
  revenue_scales: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  deal_id: string;
  buyer_id: string;
  sent_at: string;
  status: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {}
