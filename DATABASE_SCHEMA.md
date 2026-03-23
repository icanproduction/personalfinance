# iCAN Financial - Database Schema Reference

> **Last Updated:** 2026-03-22
> **Purpose:** Complete database reference to prevent column name errors
> **Source of truth:** Supabase project `zxmkyuoigbxaplydvcbu` (iCAN Financial)

---

## CRITICAL - READ BEFORE QUERIES

**ALWAYS check this file before writing ANY database query!**

**IMPORTANT:** Status/type columns use CHECK constraints (bukan ENUM).
Jika perlu menambah value baru, harus ALTER TABLE ... DROP CONSTRAINT + ADD CONSTRAINT.

---

## TABLE OF CONTENTS

1. [accounts](#1-accounts) - Bank account profiles
2. [transactions](#2-transactions) - All transaction records
3. [monthly_summaries](#3-monthly_summaries) - Monthly aggregated data
4. [credit_card_bills](#4-credit_card_bills) - CC billing summaries
5. [financial_goals](#5-financial_goals) - Savings & financial targets
6. [subscriptions](#6-subscriptions) - Recurring subscriptions
7. [team_payments](#7-team_payments) - Team salary & talent fees

---

## 1. `accounts`

**Purpose:** Bank account profiles (business, personal, credit card)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `account_number` | TEXT | NOT NULL, UNIQUE | Bank account number |
| `account_name` | TEXT | NOT NULL | Display name |
| `account_type` | TEXT | NOT NULL, CHECK | 'business', 'personal', 'credit_card' |
| `bank_name` | TEXT | NOT NULL, DEFAULT 'BCA' | Bank name |
| `branch` | TEXT | NULL | Branch name |
| `credit_limit` | NUMERIC | NULL, DEFAULT 0 | CC limit (only for credit_card) |
| `current_balance` | NUMERIC | NULL, DEFAULT 0 | Last known balance |
| `last_updated` | TIMESTAMPTZ | NULL, DEFAULT now() | Last balance update |
| `created_at` | TIMESTAMPTZ | NULL, DEFAULT now() | |

**Current Data (3 rows):**
| account_number | account_name | account_type | balance |
|----------------|-------------|--------------|---------|
| 4871047329 | iCan Production House - Business | business | 83,401,772 |
| 6390028561 | Eric Saputra - Personal | personal | 8,684,335 |
| 5409120000000290 | BCA Credit Card | credit_card | 0 (limit: 20,000,000) |

**Account UUIDs:**
```
Business:    e5297faf-0391-45de-b7f6-fa793fc28377
Personal:    c6faff9c-5ace-48e8-9d61-c973ce414f51
Credit Card: 4daff63a-a93f-4fc7-9027-429dcc1d4236
```

---

## 2. `transactions`

**Purpose:** All transaction records from bank e-statements (1,221 rows as of Mar 2026)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `account_id` | UUID | NOT NULL, FK → accounts | Which account |
| `transaction_date` | DATE | NOT NULL | Transaction date |
| `description` | TEXT | NOT NULL | Transaction description (from e-statement) |
| `amount` | NUMERIC | NOT NULL | Transaction amount (always positive) |
| `transaction_type` | TEXT | NOT NULL, CHECK | 'credit' (masuk) or 'debit' (keluar) |
| `category` | TEXT | NULL, DEFAULT 'uncategorized' | Category label |
| `subcategory` | TEXT | NULL | Subcategory label |
| `is_business_expense` | BOOLEAN | NULL, DEFAULT false | Flag for business expenses on personal/CC |
| `notes` | TEXT | NULL | Additional notes |
| `statement_period` | TEXT | NULL | E-statement period (e.g., '2026-01') |
| `created_at` | TIMESTAMPTZ | NULL, DEFAULT now() | |

**FK:** `transactions_account_id_fkey` → accounts(id)

**Common Categories:**
- `transfer_in`, `transfer_out` - Bank transfers
- `payment` - Bill/invoice payments
- `salary` - Salary disbursements
- `talent_fee` - Talent/freelancer payments
- `subscription` - Recurring subscriptions
- `food_beverage` - Makan/minum
- `transport` - Transportasi
- `shopping` - Belanja
- `entertainment` - Hiburan
- `uncategorized` - Belum dikategorikan

**Common Mistakes:**
- `transactions.date` → USE `transactions.transaction_date`
- `transactions.type` → USE `transactions.transaction_type`
- `transactions.value` → USE `transactions.amount`

---

## 3. `monthly_summaries`

**Purpose:** Monthly aggregated data per account (4 rows as of Mar 2026)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `account_id` | UUID | NOT NULL, FK → accounts | Which account |
| `period` | TEXT | NOT NULL | Period as 'YYYY-MM' (e.g., '2026-01') |
| `opening_balance` | NUMERIC | NULL, DEFAULT 0 | Balance at start of period |
| `closing_balance` | NUMERIC | NULL, DEFAULT 0 | Balance at end of period |
| `total_credit` | NUMERIC | NULL, DEFAULT 0 | Sum of all credits |
| `total_debit` | NUMERIC | NULL, DEFAULT 0 | Sum of all debits |
| `transaction_count` | INTEGER | NULL, DEFAULT 0 | Number of transactions |
| `created_at` | TIMESTAMPTZ | NULL, DEFAULT now() | |

**FK:** `monthly_summaries_account_id_fkey` → accounts(id)

**Common Mistakes:**
- `monthly_summaries.month` → USE `monthly_summaries.period`
- `monthly_summaries.balance` → USE `monthly_summaries.closing_balance`

---

## 4. `credit_card_bills`

**Purpose:** CC billing period summaries (6 rows as of Mar 2026)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `account_id` | UUID | NOT NULL, FK → accounts | CC account |
| `bill_period` | TEXT | NOT NULL | Billing period as 'YYYY-MM' |
| `total_tagihan` | NUMERIC | NOT NULL, DEFAULT 0 | Total bill amount |
| `minimum_payment` | NUMERIC | NULL, DEFAULT 0 | Minimum payment amount |
| `due_date` | DATE | NULL | Payment due date |
| `payment_status` | TEXT | NULL, DEFAULT 'unpaid', CHECK | 'unpaid', 'minimum_paid', 'full_paid' |
| `created_at` | TIMESTAMPTZ | NULL, DEFAULT now() | |

**FK:** `credit_card_bills_account_id_fkey` → accounts(id)

**Common Mistakes:**
- `credit_card_bills.amount` → USE `credit_card_bills.total_tagihan`
- `credit_card_bills.period` → USE `credit_card_bills.bill_period`
- `credit_card_bills.status` → USE `credit_card_bills.payment_status`

---

## 5. `financial_goals`

**Purpose:** Savings & financial target tracking (3 rows as of Mar 2026)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `goal_name` | TEXT | NOT NULL | Goal display name |
| `goal_type` | TEXT | NOT NULL, CHECK | 'emergency_fund', 'wedding', 'business_runway', 'investment', 'other' |
| `target_amount` | NUMERIC | NOT NULL | Target amount in IDR |
| `current_amount` | NUMERIC | NULL, DEFAULT 0 | Current progress amount |
| `target_date` | DATE | NULL | Target completion date |
| `priority` | INTEGER | NULL, DEFAULT 1 | Priority ranking (1 = highest) |
| `status` | TEXT | NULL, DEFAULT 'active', CHECK | 'active', 'achieved', 'paused' |
| `notes` | TEXT | NULL | Additional notes |
| `created_at` | TIMESTAMPTZ | NULL, DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NULL, DEFAULT now() | |

**No FK** - standalone table

**Common Mistakes:**
- `financial_goals.name` → USE `financial_goals.goal_name`
- `financial_goals.type` → USE `financial_goals.goal_type`
- `financial_goals.target` → USE `financial_goals.target_amount`
- `financial_goals.current` → USE `financial_goals.current_amount`

---

## 6. `subscriptions`

**Purpose:** Recurring subscription tracking (3 rows as of Mar 2026)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `name` | TEXT | NOT NULL | Subscription name |
| `amount` | NUMERIC | NOT NULL | Billing amount |
| `currency` | TEXT | NULL, DEFAULT 'IDR' | Currency code |
| `billing_cycle` | TEXT | NOT NULL, CHECK | 'monthly' or 'annual' |
| `category` | TEXT | NULL, DEFAULT 'business_tool' | Category label |
| `is_business` | BOOLEAN | NULL, DEFAULT true | Is this a business expense |
| `next_billing_date` | DATE | NULL | Next billing date |
| `account_id` | UUID | NULL, FK → accounts | Which account is charged |
| `status` | TEXT | NULL, DEFAULT 'active', CHECK | 'active' or 'cancelled' |
| `created_at` | TIMESTAMPTZ | NULL, DEFAULT now() | |

**FK:** `subscriptions_account_id_fkey` → accounts(id)

---

## 7. `team_payments`

**Purpose:** Team salary & talent fee records (0 rows as of Mar 2026)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `person_name` | TEXT | NOT NULL | Team member name |
| `role` | TEXT | NULL | Role/position |
| `payment_type` | TEXT | NOT NULL, CHECK | 'salary', 'talent_fee', 'freelance', 'bonus' |
| `amount` | NUMERIC | NOT NULL | Payment amount |
| `payment_date` | DATE | NOT NULL | Date of payment |
| `period` | TEXT | NULL | Period reference (e.g., '2026-01') |
| `account_id` | UUID | NULL, FK → accounts | Paid from which account |
| `notes` | TEXT | NULL | Additional notes |
| `created_at` | TIMESTAMPTZ | NULL, DEFAULT now() | |

**FK:** `team_payments_account_id_fkey` → accounts(id)

---

## FOREIGN KEY RELATIONSHIPS

```
accounts (id)
  ├→ transactions (account_id) [1:N]
  ├→ monthly_summaries (account_id) [1:N]
  ├→ credit_card_bills (account_id) [1:N]
  ├→ subscriptions (account_id) [1:N]
  └→ team_payments (account_id) [1:N]
```

All FKs follow the pattern: `{table_name}_account_id_fkey`

---

## QUICK REFERENCE - COLUMN NAME CHEATSHEET

| WRONG | CORRECT |
|-------|---------|
| `transactions.date` | `transactions.transaction_date` |
| `transactions.type` | `transactions.transaction_type` |
| `transactions.value` | `transactions.amount` |
| `monthly_summaries.month` | `monthly_summaries.period` |
| `monthly_summaries.balance` | `monthly_summaries.closing_balance` |
| `credit_card_bills.amount` | `credit_card_bills.total_tagihan` |
| `credit_card_bills.period` | `credit_card_bills.bill_period` |
| `credit_card_bills.status` | `credit_card_bills.payment_status` |
| `financial_goals.name` | `financial_goals.goal_name` |
| `financial_goals.type` | `financial_goals.goal_type` |
| `financial_goals.target` | `financial_goals.target_amount` |
| `financial_goals.current` | `financial_goals.current_amount` |
| `accounts.type` | `accounts.account_type` |
| `accounts.balance` | `accounts.current_balance` |
| `accounts.limit` | `accounts.credit_limit` |

---

## FK JOIN PATTERNS

```typescript
// Transactions with account info
.select('*, account:accounts!transactions_account_id_fkey(account_name, account_type)')

// Monthly summaries with account info
.select('*, account:accounts!monthly_summaries_account_id_fkey(account_name, account_type)')

// CC bills with account info
.select('*, account:accounts!credit_card_bills_account_id_fkey(account_name)')

// Subscriptions with account info
.select('*, account:accounts!subscriptions_account_id_fkey(account_name)')

// Team payments with account info
.select('*, account:accounts!team_payments_account_id_fkey(account_name)')
```

---

**Last Updated:** 2026-03-22
