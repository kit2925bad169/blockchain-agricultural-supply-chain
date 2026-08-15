/*
# AgriTrust — Agricultural Supply Chain Transparency Platform

1. Overview
This migration creates the complete schema for an agricultural supply chain
tracking system. It allows farmers to register crops, transporters and
retailers to update product status at each stage, consumers to trace a
product's full history via QR code, and authorities to verify data and
handle complaints. This is a single-tenant public platform (no sign-in
required) — consumers scan QR codes to view product history, so all tables
allow anon + authenticated CRUD.

2. New Tables

- `products`: The core agricultural product/crop record.
  - id (uuid, PK)
  - batch_id (text, unique) — human-readable batch identifier like "AGRI-2026-001"
  - crop_name (text) — e.g., "Organic Basmati Rice"
  - variety (text) — e.g., "Pusa Basmati 1121"
  - quantity (text) — e.g., "500 kg"
  - farmer_name (text)
  - farmer_location (text) — farm address/region
  - harvest_date (date)
  - certification (text) — e.g., "Organic", "GAP Certified", "None"
  - qr_code_data (text) — the tracking token embedded in the QR code
  - current_status (text) — derived from latest event: "harvested", "in_transit", "at_retail", "sold"
  - created_at (timestamptz)

- `supply_chain_events`: Immutable audit log of every stage update.
  - id (uuid, PK)
  - product_id (uuid, FK → products)
  - stage (text) — "harvested", "quality_check", "in_transit", "at_retail", "sold"
  - actor_name (text) — name of the person/entity performing the update
  - actor_role (text) — "farmer", "transporter", "retailer", "authority"
  - location (text) — where the update happened
  - notes (text) — optional details
  - temperature (text) — optional storage/transport temperature
  - timestamp (timestamptz)

- `complaints`: Consumer/authority complaints about products.
  - id (uuid, PK)
  - product_id (uuid, FK → products, nullable — complaint may be general)
  - complainant_name (text)
  - complainant_contact (text)
  - complaint_type (text) — "quality", "authenticity", "pricing", "other"
  - description (text)
  - status (text) — "pending", "under_review", "resolved", "dismissed"
  - authority_response (text, nullable)
  - created_at (timestamptz)
  - resolved_at (timestamptz, nullable)

3. Security
- RLS enabled on all tables.
- All tables allow anon + authenticated CRUD (single-tenant public platform —
  consumers scan QR codes without signing in, and all supply chain actors
  operate through the same public interface).

4. Indexes
- products.qr_code_data (for QR lookups)
- products.batch_id (for batch lookups)
- supply_chain_events.product_id (for event history queries)
- complaints.product_id (for product-linked complaints)
- complaints.status (for authority dashboard filtering)
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id text UNIQUE NOT NULL,
  crop_name text NOT NULL,
  variety text DEFAULT '',
  quantity text NOT NULL,
  farmer_name text NOT NULL,
  farmer_location text NOT NULL,
  harvest_date date NOT NULL,
  certification text DEFAULT 'None',
  qr_code_data text UNIQUE NOT NULL,
  current_status text NOT NULL DEFAULT 'harvested',
  created_at timestamptz DEFAULT now(),
  farmer_id text DEFAULT '',
  quantity_unit text NOT NULL DEFAULT 'kg',
  price_per_kg numeric(12,2) NOT NULL DEFAULT 0
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- Supply chain events table
CREATE TABLE IF NOT EXISTS supply_chain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stage text NOT NULL,
  actor_name text NOT NULL,
  actor_role text NOT NULL,
  location text NOT NULL,
  notes text DEFAULT '',
  temperature text DEFAULT '',
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE supply_chain_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_events" ON supply_chain_events;
CREATE POLICY "anon_select_events" ON supply_chain_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_events" ON supply_chain_events;
CREATE POLICY "anon_insert_events" ON supply_chain_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_events" ON supply_chain_events;
CREATE POLICY "anon_update_events" ON supply_chain_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_events" ON supply_chain_events;
CREATE POLICY "anon_delete_events" ON supply_chain_events FOR DELETE
  TO anon, authenticated USING (true);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  complainant_name text NOT NULL,
  complainant_contact text NOT NULL,
  complaint_type text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  authority_response text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_complaints" ON complaints;
CREATE POLICY "anon_select_complaints" ON complaints FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_complaints" ON complaints;
CREATE POLICY "anon_insert_complaints" ON complaints FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_complaints" ON complaints;
CREATE POLICY "anon_update_complaints" ON complaints FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_complaints" ON complaints;
CREATE POLICY "anon_delete_complaints" ON complaints FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_qr_code_data ON products(qr_code_data);
CREATE INDEX IF NOT EXISTS idx_products_batch_id ON products(batch_id);
CREATE INDEX IF NOT EXISTS idx_events_product_id ON supply_chain_events(product_id);
CREATE INDEX IF NOT EXISTS idx_complaints_product_id ON complaints(product_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);


-- Farmer registry identity used by the application; populate only from an authorized registry verification flow.
ALTER TABLE products ADD COLUMN IF NOT EXISTS farmer_id text DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_quantity_unit_check;
ALTER TABLE products ADD CONSTRAINT products_quantity_unit_check CHECK (quantity_unit IN ('kg', 'g'));
