-- AgriTrust: requested farmer crop pricing and quantity units.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS quantity_unit text NOT NULL DEFAULT 'kg';

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS price_per_kg numeric(12,2) NOT NULL DEFAULT 0;

UPDATE products
SET quantity_unit = 'kg'
WHERE quantity_unit IS NULL OR quantity_unit = '';

UPDATE products
SET price_per_kg = 0
WHERE price_per_kg IS NULL;

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_quantity_unit_check;

ALTER TABLE products
  ADD CONSTRAINT products_quantity_unit_check CHECK (quantity_unit IN ('kg', 'g'));
