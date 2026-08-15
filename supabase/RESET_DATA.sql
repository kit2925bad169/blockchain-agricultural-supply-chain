-- One-time reset for the existing project data.
-- Run this in Supabase SQL Editor only if you want to remove all existing
-- products, supply-chain events, and complaints before the fresh deployment.
DELETE FROM complaints;
DELETE FROM supply_chain_events;
DELETE FROM products;
