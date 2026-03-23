-- ============================================
-- iCAN Financial - Migration 02
-- Budget Categories, BCA Sync Logs, Push Subscriptions
-- ============================================
-- Run this in Supabase SQL Editor
-- Last Updated: 2026-03-22
-- ============================================

-- ============================================
-- 1. BUDGET CATEGORIES
-- ============================================
-- Per-category monthly budget tracking

CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  monthly_budget NUMERIC NOT NULL DEFAULT 0,
  warning_threshold NUMERIC NOT NULL DEFAULT 0.8,
  icon TEXT DEFAULT 'circle',
  color TEXT DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category)
);

CREATE TRIGGER trg_budget_categories_updated_at
  BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. BCA SYNC LOGS
-- ============================================
-- Track Chrome extension sync history

CREATE TABLE IF NOT EXISTS bca_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  transactions_found INTEGER DEFAULT 0,
  transactions_new INTEGER DEFAULT 0,
  transactions_duplicate INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bca_sync_logs_date ON bca_sync_logs(sync_date);

-- ============================================
-- 3. PUSH SUBSCRIPTIONS
-- ============================================
-- Web Push notification subscriptions

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_label TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. ADD COLUMNS TO TRANSACTIONS
-- ============================================
-- Auto-categorization tracking

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS category_confidence NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_categorized BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bca_sync_id UUID REFERENCES bca_sync_logs(id);

CREATE INDEX IF NOT EXISTS idx_transactions_bca_sync ON transactions(bca_sync_id);

-- ============================================
-- SEED: Default Budget Categories
-- ============================================

INSERT INTO budget_categories (category, monthly_budget, warning_threshold, icon, color, sort_order)
VALUES
  ('food_beverage', 3000000, 0.8, 'utensils', '#ef4444', 1),
  ('transport', 1500000, 0.8, 'car', '#f97316', 2),
  ('coffee', 500000, 0.8, 'coffee', '#8b5cf6', 3),
  ('subscription', 1000000, 0.8, 'credit-card', '#3b82f6', 4),
  ('shopping', 2000000, 0.8, 'shopping-bag', '#ec4899', 5),
  ('entertainment', 1000000, 0.8, 'gamepad-2', '#10b981', 6),
  ('transfer_out', 5000000, 0.8, 'send', '#6366f1', 7),
  ('payment', 3000000, 0.8, 'receipt', '#f59e0b', 8),
  ('other', 1000000, 0.8, 'circle', '#64748b', 9)
ON CONFLICT (category) DO NOTHING;
