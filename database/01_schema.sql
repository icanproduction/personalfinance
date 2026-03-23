-- ============================================
-- iCAN Financial - Database Schema
-- ============================================
-- Run this in Supabase SQL Editor to create all tables
-- Supabase Project: zxmkyuoigbxaplydvcbu (iCAN Financial)
-- Last Updated: 2026-03-22
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ACCOUNTS
-- ============================================
-- Bank accounts: business, personal, credit card

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('business', 'personal', 'credit_card')),
  bank_name TEXT NOT NULL DEFAULT 'BCA',
  branch TEXT,
  credit_limit NUMERIC DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. TRANSACTIONS
-- ============================================
-- All transaction records from bank e-statements

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  category TEXT DEFAULT 'uncategorized',
  subcategory TEXT,
  is_business_expense BOOLEAN DEFAULT false,
  notes TEXT,
  statement_period TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_period ON transactions(statement_period);
CREATE INDEX idx_transactions_account_date ON transactions(account_id, transaction_date);

-- ============================================
-- 3. MONTHLY SUMMARIES
-- ============================================
-- Monthly aggregated data per account

CREATE TABLE IF NOT EXISTS monthly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  opening_balance NUMERIC DEFAULT 0,
  closing_balance NUMERIC DEFAULT 0,
  total_credit NUMERIC DEFAULT 0,
  total_debit NUMERIC DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, period)
);

CREATE INDEX idx_monthly_summaries_account_id ON monthly_summaries(account_id);
CREATE INDEX idx_monthly_summaries_period ON monthly_summaries(period);

-- ============================================
-- 4. CREDIT CARD BILLS
-- ============================================
-- CC billing period summaries

CREATE TABLE IF NOT EXISTS credit_card_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  bill_period TEXT NOT NULL,
  total_tagihan NUMERIC NOT NULL DEFAULT 0,
  minimum_payment NUMERIC DEFAULT 0,
  due_date DATE,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'minimum_paid', 'full_paid')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, bill_period)
);

CREATE INDEX idx_credit_card_bills_account_id ON credit_card_bills(account_id);
CREATE INDEX idx_credit_card_bills_period ON credit_card_bills(bill_period);

-- ============================================
-- 5. FINANCIAL GOALS
-- ============================================
-- Savings & financial target tracking

CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_name TEXT NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('emergency_fund', 'wedding', 'business_runway', 'investment', 'other')),
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  target_date DATE,
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. SUBSCRIPTIONS
-- ============================================
-- Recurring subscription tracking

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'IDR',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  category TEXT DEFAULT 'business_tool',
  is_business BOOLEAN DEFAULT true,
  next_billing_date DATE,
  account_id UUID REFERENCES accounts(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_account_id ON subscriptions(account_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- 7. TEAM PAYMENTS
-- ============================================
-- Team salary & talent fee records

CREATE TABLE IF NOT EXISTS team_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  role TEXT,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('salary', 'talent_fee', 'freelance', 'bonus')),
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  period TEXT,
  account_id UUID REFERENCES accounts(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_team_payments_account_id ON team_payments(account_id);
CREATE INDEX idx_team_payments_date ON team_payments(payment_date);
CREATE INDEX idx_team_payments_type ON team_payments(payment_type);

-- ============================================
-- AUTO-UPDATE TRIGGER (updated_at)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_financial_goals_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED: Default Accounts
-- ============================================

INSERT INTO accounts (account_number, account_name, account_type, bank_name, branch, credit_limit, current_balance)
VALUES
  ('4871047329', 'iCan Production House - Business', 'business', 'BCA', 'KCP Pademangan', 0, 0),
  ('6390028561', 'Eric Saputra - Personal', 'personal', 'BCA', 'KCP Rajawali', 0, 0),
  ('5409120000000290', 'BCA Credit Card', 'credit_card', 'BCA', NULL, 20000000, 0)
ON CONFLICT (account_number) DO NOTHING;

-- ============================================
-- SEED: Default Financial Goals
-- ============================================

INSERT INTO financial_goals (goal_name, goal_type, target_amount, current_amount, priority, notes)
VALUES
  ('Emergency Fund', 'emergency_fund', 90000000, 8684335, 1, 'Target 6 bulan personal expense (Rp 15jt x 6)'),
  ('Wedding Fund', 'wedding', 100000000, 0, 2, 'Planning phase - target TBD'),
  ('Business Runway', 'business_runway', 150000000, 83401772, 3, 'Target 3 bulan operational cost')
ON CONFLICT DO NOTHING;
