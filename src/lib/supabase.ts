import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  batch_id: string;
  crop_name: string;
  variety: string;
  quantity: string;
  quantity_unit: 'kg' | 'g';
  price_per_kg: number;
  farmer_name: string;
  farmer_location: string;
  harvest_date: string;
  certification: string;
  qr_code_data: string;
  current_status: string;
  created_at: string;
  farmer_id?: string;
};

export type SupplyChainEvent = {
  id: string;
  product_id: string;
  stage: string;
  actor_name: string;
  actor_role: string;
  location: string;
  notes: string;
  temperature: string;
  timestamp: string;
};

export type Complaint = {
  id: string;
  product_id: string | null;
  complainant_name: string;
  complainant_contact: string;
  complaint_type: string;
  description: string;
  status: string;
  authority_response: string | null;
  created_at: string;
  resolved_at: string | null;
};

export type Role = 'farmer' | 'transporter' | 'retailer' | 'consumer' | 'authority';

export const STAGE_LABELS: Record<string, string> = {
  harvested: 'Harvested',
  quality_check: 'Quality Check',
  in_transit: 'In Transit',
  at_retail: 'At Retail',
  sold: 'Sold',
};

export const STATUS_COLORS: Record<string, string> = {
  harvested: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  quality_check: 'bg-blue-100 text-blue-700 border-blue-200',
  in_transit: 'bg-amber-100 text-amber-700 border-amber-200',
  at_retail: 'bg-purple-100 text-purple-700 border-purple-200',
  sold: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const COMPLAINT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  under_review: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  dismissed: 'bg-rose-100 text-rose-700 border-rose-200',
};
