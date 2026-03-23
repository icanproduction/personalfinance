# iCAN Financial - Claude Code Context

> **Last Updated:** 2026-03-22
> **Project:** Personal & Business Financial Management Dashboard
> **Supabase Project ID:** `zxmkyuoigbxaplydvcbu`
> **Live URL:** https://ican-financial.vercel.app (TBD)

---

## PROJECT OVERVIEW

**iCAN Financial** adalah personal financial dashboard untuk mengelola keuangan bisnis (iCAN Production House) dan personal (Eric Saputra). Sistem ini mencakup tracking transaksi dari 3 akun bank (2 rekening BCA + 1 kartu kredit BCA), analisis cashflow, monitoring tagihan CC, tracking financial goals, dan visualisasi data keuangan secara realtime.

**Core Users:**
- **Owner (Eric Saputra)** - Single user, full access ke semua data keuangan

**Core Concept**: Dashboard keuangan terintegrasi yang menarik data dari Supabase database. Data diinput secara bulanan dari parsing e-statement BCA (PDF). Dashboard menampilkan overview keuangan, tren, alerts, dan progress goals secara realtime.

**Data Sources:**
- Rekening 4871047329 (BCA KCP Pademangan) - Business account, iCan Production House
- Rekening 6390028561 (BCA KCP Rajawali) - Personal account, Eric Saputra
- Kartu Kredit BCA 5409-12XX-XXXX-0290 - Credit card, limit Rp 20.000.000

---

## OWNER FINANCIAL PROFILE

### Personal Info
- **Nama:** Eric Saputra
- **Domisili:** Pademangan, Jakarta Utara
- **Bisnis:** iCAN Production House (agency/production house)
- **Email:** icanproductionhouse@gmail.com

### Income Sources
- **Gaji dari bisnis:** Rp 7.000.000/bulan (transfer dari business → personal)
- **Business revenue:** Varies per project (agency model, Rp 50-150jt/bulan)

### Team & Operational Costs (dibayar dari business account)
- **Zaky** - Videografer, Rp 4.000.000/bulan
- **Ilham** - Editor, Rp 4.000.000/bulan
- **Reza** - Fotografer, Rp 4.000.000/bulan
- **Talent fees** - Per project, varies (Rp 500rb - 5jt per talent)
- **Operational** - Props, transport, konsumsi, sewa studio

### Current Financial Snapshot (Feb 2026)
- **Business balance:** Rp 83.401.772
- **Personal balance:** Rp 8.684.335
- **CC outstanding:** Varies monthly (Rp 3-8jt range)
- **CC Limit:** Rp 20.000.000

### Financial Goals & Motivations
1. **Cashflow Management** - Mengelola arus kas bisnis agar tidak minus, menjaga runway minimal 3 bulan
2. **Wedding Fund** - Rencana menikah (target & timeline TBD, estimasi Rp 100jt+)
3. **Emergency Fund** - Target Rp 90.000.000 (6 bulan personal expense @ Rp 15jt)
4. **Spending Control** - Personal spending Rp 10-14jt/bulan padahal gaji hanya Rp 7jt (RED FLAG)
5. **Business Growth** - Meningkatkan revenue dan profit margin

### Critical Financial Observations (RED FLAGS)
- Personal monthly spending (Rp 10-14jt) MELEBIHI gaji (Rp 7jt) — selisih ditutup dari tabungan/bisnis
- Beberapa business tools (Freepik, Notion, Metricool) dicharge ke CC personal, bukan business account
- CC utilization rate pernah tinggi (>30%) di bulan tertentu
- Belum ada emergency fund yang proper
- Wedding fund belum dimulai

### Business Subscription Details
| Tool | Amount | Cycle | Category |
|------|--------|-------|----------|
| Freepik | ~Rp 1.500.000 | Annual | Business tool (design assets) |
| Notion | ~Rp 750.000 | Annual | Business tool (project management) |
| Metricool | ~Rp 1.200.000 | Annual | Business tool (social media analytics) |

---

## DESKTOP-FIRST DESIGN

> **App ini didesain untuk digunakan di DESKTOP/LAPTOP (browser).**

1. **Layout**: Sidebar navigation di kiri, content area di kanan (dark mode)
2. **Responsive**: Mendukung mobile view tapi prioritas desktop
3. **Dashboard**: KPI cards, charts (Chart.js/Recharts), data tables
4. **Color Scheme**: Dark theme untuk financial dashboard professional look

---

## TECH STACK

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts or Chart.js |
| **Icons** | Lucide React |
| **Date Utils** | date-fns |
| **Number Format** | Custom IDR formatter |
| **Hosting** | Vercel |

---

## PROJECT STRUCTURE

```
ican-financial/
├── CLAUDE.md                          # This file - READ FIRST
├── CODE_INSTRUCTIONS.md               # Development guidelines - READ SECOND
├── DATABASE_SCHEMA.md                 # Complete database reference - ALWAYS CHECK
├── DEPLOY.md                          # Deployment guide
├── vercel.json                        # Vercel config
├── database/
│   └── 01_schema.sql                 # Core schema (all tables)
├── src/
│   ├── app/
│   │   ├── (dashboard)/              # Dashboard routes
│   │   │   ├── page.tsx              # Main overview dashboard
│   │   │   ├── transactions/         # Transaction list & filters
│   │   │   ├── accounts/             # Account detail views
│   │   │   ├── credit-card/          # CC bills & tracking
│   │   │   ├── goals/                # Financial goals tracking
│   │   │   ├── subscriptions/        # Recurring subscriptions
│   │   │   ├── team-payments/        # Team salary & talent fees
│   │   │   └── layout.tsx            # Dashboard layout with sidebar
│   │   ├── api/
│   │   │   └── parse-statement/      # E-statement PDF parser (future)
│   │   ├── page.tsx                  # Root redirect to dashboard
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx           # Navigation sidebar
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx           # KPI summary card
│   │   │   ├── AccountCard.tsx       # Account overview card
│   │   │   ├── AlertCard.tsx         # Financial alert/warning
│   │   │   └── GoalProgress.tsx      # Goal progress bar
│   │   ├── charts/
│   │   │   ├── CashflowChart.tsx     # Income vs Expense bar chart
│   │   │   ├── CCTrendChart.tsx      # CC tagihan trend line
│   │   │   ├── SpendingDonut.tsx     # Spending by category
│   │   │   └── MonthlyCompare.tsx    # Month-over-month comparison
│   │   └── ui/
│   │       ├── PageHeader.tsx        # Reusable page header
│   │       ├── StatusBadge.tsx       # Status display component
│   │       └── CurrencyDisplay.tsx   # IDR currency formatter
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client
│   │   ├── formatters.ts            # Currency & date formatters
│   │   └── calculations.ts          # Financial calculation helpers
│   └── types/
│       └── database.ts              # TypeScript database types
├── package.json
└── tsconfig.json
```

---

## DATABASE SCHEMA

**Full reference:** See `DATABASE_SCHEMA.md`

### Core Tables
- `accounts` - Bank account profiles (business, personal, credit_card)
- `transactions` - All transaction records from e-statements
- `monthly_summaries` - Monthly aggregated data per account
- `credit_card_bills` - CC billing period summaries
- `financial_goals` - Savings & financial target tracking
- `subscriptions` - Recurring subscriptions (business tools, services)
- `team_payments` - Team salary & talent fee records

---

## PAGE-BY-PAGE FEATURE SPECS

### 1. Dashboard / Overview (`/` or `/(dashboard)/page.tsx`)
Main landing page — bird's eye view of all finances.

**KPI Cards (top row, 4 cards):**
- Total Saldo Keseluruhan (business + personal) — blue
- Business Net Cashflow bulan ini (credit - debit) — green/red
- CC Tagihan Terkini — purple
- Personal Spending bulan ini — yellow/red

**Account Cards (3 cards):**
- Business Account: saldo, income/expense bulan ini
- Personal Account: saldo, income/expense bulan ini
- Credit Card: tagihan terkini, utilization bar, due date

**Alerts Section:**
- Personal spending > Rp 7jt (melebihi gaji)
- CC utilization > 30%
- Business balance < 3x monthly burn
- CC due date approaching (< 7 hari)

**Charts:**
- Business Cashflow bar chart (income vs expense, per bulan)
- CC Tagihan trend line (6 bulan terakhir)
- Personal spending by category (donut chart)

**Goal Progress Bars:**
- Emergency Fund: current/target
- Wedding Fund: current/target
- Business Runway: months remaining

### 2. Transactions (`/(dashboard)/transactions/page.tsx`)
Full transaction explorer with filters.

**Filters:** Account type (all/business/personal/cc), Period (month picker), Type (credit/debit), Category, Search by description
**Table columns:** Date, Description, Amount (green/red), Account, Category, Type
**Features:** Sort by date/amount, pagination, export capability (future)

### 3. Accounts (`/(dashboard)/accounts/page.tsx`)
Detailed view per account.

**Per account card:** Balance history chart (line), Monthly income/expense comparison, Top transactions, Recent activity list

### 4. Credit Card (`/(dashboard)/credit-card/page.tsx`)
CC-specific tracking.

**Content:** Current tagihan, utilization gauge, bill history table (period, tagihan, min payment, status, due date), CC spending by category chart, Payment status badges

### 5. Goals (`/(dashboard)/goals/page.tsx`)
Financial goal tracking & management.

**Per goal card:** Progress bar with percentage, Current vs target amount, Target date & time remaining, Monthly contribution needed to reach target, Edit goal form

### 6. Subscriptions (`/(dashboard)/subscriptions/page.tsx`)
Recurring subscription management.

**Table:** Name, Amount, Cycle (monthly/annual), Next billing date, Account charged, Business/Personal tag
**Summary:** Total monthly cost, Total annual cost, Upcoming bills this month

### 7. Team Payments (`/(dashboard)/team-payments/page.tsx`)
Team salary & talent fee tracking.

**Table:** Person, Role, Amount, Payment date, Type (salary/talent_fee), Period
**Summary:** Total monthly payroll, Payment calendar

---

## NO AUTHENTICATION

**This is a personal dashboard** - no login/auth system needed.
- Single user application (Eric Saputra)
- No RLS policies needed (or use simple service role)
- Supabase client connects directly with anon key
- If auth is needed later, can add Supabase Auth

---

## KEY BUSINESS RULES

1. **Dual-Ledger System** - Semua transaksi dikategorikan sebagai Business atau Personal:
   - Business account (4871047329) = 100% business transactions
   - Personal account (6390028561) = personal transactions, BUT some are business-related
   - Credit card = mix of business subscriptions dan personal spending

2. **Monthly E-Statement Cycle** - Data diinput bulanan dari PDF e-statement BCA:
   - Rekening koran: periode 1 bulan
   - CC statement: billing cycle (bisa beda tanggal)
   - Scheduled reminder setiap tanggal 1 untuk upload e-statement

3. **Currency** - Semua dalam IDR (Indonesian Rupiah):
   - Format: `Rp 1.234.567` (titik sebagai thousand separator)
   - Beberapa transaksi CC dalam USD (auto-converted by BCA)

4. **Credit Card Rules**:
   - Limit: Rp 20.000.000
   - Tagihan harus dilunasi full (hindari minimum payment)
   - Track utilization rate (target < 30%)

5. **Financial Goals**:
   - Business Runway: Target 3 bulan operational cost
   - Emergency Fund: Target Rp 90.000.000 (6 bulan personal expense)
   - Wedding Fund: TBD (planning phase)

6. **Team Payments** - Gaji tim & talent fee dibayar dari business account:
   - Monthly salary untuk tim tetap
   - Per-project talent fee untuk freelancers

7. **Subscription Tracking**:
   - Business tools (Freepik, Notion, Metricool) = ANNUAL billing, business expense
   - Track next billing date untuk budget planning

8. **Key Financial Alerts**:
   - Personal spending > Rp 7.000.000/bulan (melebihi gaji)
   - CC utilization > 30%
   - Business account < 3x monthly operational cost
   - CC payment approaching due date

---

## SUPABASE API REFERENCE

### Project Details
- **Project ID:** `zxmkyuoigbxaplydvcbu`
- **Region:** ap-southeast-1 (Singapore)
- **Database Host:** `db.zxmkyuoigbxaplydvcbu.supabase.co`
- **API URL:** `https://zxmkyuoigbxaplydvcbu.supabase.co`
- **Supabase Dashboard:** https://supabase.com/dashboard/project/zxmkyuoigbxaplydvcbu

### API Keys
```
# Anon Key (public, client-side safe)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bWt5dW9pZ2J4YXBseWR2Y2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTY4NDcsImV4cCI6MjA4OTczMjg0N30.YA4j9JdDxkqvNNifJD0bkr10SIVivJPJ8l4vBi1MHnM

# Publishable Key (modern alternative)
SUPABASE_PUBLISHABLE_KEY=sb_publishable_oRDuDh7aiZvUewziruVejw_S8gYH8DQ
```

### REST API Endpoints
```
# Base URL
https://zxmkyuoigbxaplydvcbu.supabase.co/rest/v1/

# Examples:
GET  /rest/v1/accounts          → List all accounts
GET  /rest/v1/transactions      → List transactions
GET  /rest/v1/monthly_summaries → Monthly summaries
GET  /rest/v1/credit_card_bills → CC bills
GET  /rest/v1/financial_goals   → Goals
GET  /rest/v1/subscriptions     → Subscriptions
GET  /rest/v1/team_payments     → Team payments

# Headers required:
apikey: <anon-key>
Authorization: Bearer <anon-key>
```

### Realtime (WebSocket)
```
wss://zxmkyuoigbxaplydvcbu.supabase.co/realtime/v1/websocket
```

---

## ENVIRONMENT VARIABLES

### Client-side (public):
```
NEXT_PUBLIC_SUPABASE_URL=https://zxmkyuoigbxaplydvcbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bWt5dW9pZ2J4YXBseWR2Y2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTY4NDcsImV4cCI6MjA4OTczMjg0N30.YA4j9JdDxkqvNNifJD0bkr10SIVivJPJ8l4vBi1MHnM
```

---

## CODING CONVENTIONS

### Client-Side Data Fetching
```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)
```

### Currency Formatting
```typescript
// ALWAYS use this helper for displaying IDR amounts
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
// Output: "Rp 1.234.567"
```

### Account IDs (UUIDs in Supabase)
```
Business (4871047329): e5297faf-0391-45de-b7f6-fa793fc28377
Personal (6390028561): c6faff9c-5ace-48e8-9d61-c973ce414f51
Credit Card:           4daff63a-a93f-4fc7-9027-429dcc1d4236
```

### FK Joins
```typescript
// Transactions with account info
const { data } = await supabase
  .from('transactions')
  .select('*, account:accounts!transactions_account_id_fkey(account_name, account_type)')
```

---

## CURRENT STATUS

**Completed:**
- [x] Supabase project created (iCAN Financial)
- [x] Database schema designed & tables created
- [x] 1,221 transactions imported (Jan-Feb 2026, all 3 accounts)
- [x] 3 accounts configured (business, personal, credit_card)
- [x] 4 monthly summaries created
- [x] 6 credit card bills tracked (Oct 2025 - Mar 2026)
- [x] 3 financial goals set (emergency fund, wedding, business runway)
- [x] 3 subscriptions tracked (Freepik, Notion, Metricool)
- [x] Project documentation (CLAUDE.md, CODE_INSTRUCTIONS.md, DATABASE_SCHEMA.md, DEPLOY.md)

**In Progress:**
- [ ] Next.js dashboard app
- [ ] Vercel deployment

**Future:**
- [ ] E-statement PDF parser (auto-import from uploaded PDFs)
- [ ] Monthly scheduled report via email
- [ ] Investment tracking module
- [ ] Mobile responsive improvements

---

**Last Updated:** 2026-03-22
**Version:** 1.0 - iCAN Financial System
