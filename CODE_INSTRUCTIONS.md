# iCAN Financial - Code Instructions

> Development guidelines to prevent bugs and maintain consistency.
> **RULE: Read this file BEFORE writing any code.**

---

## CORE PRINCIPLES

1. **Type Safety First** - Use TypeScript strictly, no `any` types
2. **Database-Driven** - ALWAYS check DATABASE_SCHEMA.md before writing queries
3. **Supabase-First** - Before building ANY new feature, ALWAYS verify the Supabase schema first
4. **Error Handling** - Always handle errors with try/catch and user-friendly messages
5. **Bahasa Indonesia** - All UI text/labels in Bahasa Indonesia, code in English
6. **Dark Theme** - All UI components use dark color scheme

---

## SUPABASE VERIFICATION RULE (CRITICAL)

> **SEBELUM membuat fitur baru, WAJIB cek Supabase database dulu!**

### Checklist sebelum coding fitur baru:
1. **Cek tabel exist** - Pastikan tabel yang dibutuhkan sudah ada di Supabase
2. **Cek kolom** - Verifikasi nama kolom & tipe data sesuai DATABASE_SCHEMA.md
3. **Cek CHECK constraints** - Status columns pakai CHECK constraints, bukan ENUM
4. **Cek FK constraints** - Pastikan foreign key relationship sudah benar
5. **Update DATABASE_SCHEMA.md** - Setelah ALTER/CREATE di Supabase, update dokumentasi

### CHECK constraint values yang digunakan:
| Column | Table | Values |
|--------|-------|--------|
| `account_type` | accounts | 'business', 'personal', 'credit_card' |
| `transaction_type` | transactions | 'credit', 'debit' |
| `payment_status` | credit_card_bills | 'unpaid', 'minimum_paid', 'full_paid' |
| `goal_type` | financial_goals | 'emergency_fund', 'wedding', 'business_runway', 'investment', 'other' |
| `goal status` | financial_goals | 'active', 'achieved', 'paused' |
| `billing_cycle` | subscriptions | 'monthly', 'annual' |
| `subscription status` | subscriptions | 'active', 'cancelled' |
| `payment_type` | team_payments | 'salary', 'talent_fee', 'freelance', 'bonus' |

---

## NAMING CONVENTIONS

### Database
- **Tables**: `snake_case` (e.g., `monthly_summaries`, `credit_card_bills`)
- **Columns**: `snake_case` (e.g., `created_at`, `account_id`)
- **Foreign Keys**: `{table_singular}_id` (e.g., `account_id`)

### TypeScript/React
- **Components**: `PascalCase.tsx` (e.g., `Sidebar.tsx`, `KPICard.tsx`)
- **Utility files**: `camelCase.ts` (e.g., `formatters.ts`, `calculations.ts`)
- **Functions**: `camelCase` (e.g., `formatIDR`, `calculateNetCashflow`)
- **Types/Interfaces**: `PascalCase` (e.g., `Account`, `Transaction`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `ACCOUNT_IDS`, `CC_LIMIT`)

---

## DATABASE RULES

### CRITICAL - Always Verify Column Names

Before writing ANY database query:
1. Open `DATABASE_SCHEMA.md`
2. Find the exact table and column names
3. Copy column names from schema (DON'T GUESS!)

### Common Mistakes to Avoid

**DON'T:**
```typescript
// Wrong - guessing column names
const { data } = await supabase
  .from('transactions')
  .select('date, type, value')  // WRONG!
```

**DO:**
```typescript
// Correct - verified from DATABASE_SCHEMA.md
const { data } = await supabase
  .from('transactions')
  .select('transaction_date, transaction_type, amount')  // Verified!
```

### Query Patterns

**Get Transactions by Account:**
```typescript
const { data } = await supabase
  .from('transactions')
  .select('*')
  .eq('account_id', accountId)
  .order('transaction_date', { ascending: false })
```

**Get Transactions with Account Info (FK Join):**
```typescript
const { data } = await supabase
  .from('transactions')
  .select('*, account:accounts!transactions_account_id_fkey(account_name, account_type)')
  .order('transaction_date', { ascending: false })
```

**Get Monthly Summary by Period:**
```typescript
const { data } = await supabase
  .from('monthly_summaries')
  .select('*, account:accounts!monthly_summaries_account_id_fkey(account_name, account_type)')
  .eq('period', '2026-02')
```

**Get CC Bills Sorted:**
```typescript
const { data } = await supabase
  .from('credit_card_bills')
  .select('*')
  .order('due_date', { ascending: false })
```

---

## SUPABASE CLIENT SETUP

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## UI COMPONENT PATTERNS

### Page Layout (Dark Theme with Sidebar)
```typescript
// Already handled by (dashboard)/layout.tsx with Sidebar
// Each page just needs content:
export default function SomePage() {
  return (
    <div className="p-6">
      <PageHeader title="Judul Halaman" description="Deskripsi" />
      {/* Page content */}
    </div>
  )
}
```

### KPI Card Pattern
```typescript
<div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-sm">Label</p>
      <p className="text-2xl font-bold text-white mt-1">{formatIDR(value)}</p>
    </div>
    <div className="p-3 bg-blue-500/20 rounded-lg">
      <Icon className="w-6 h-6 text-blue-400" />
    </div>
  </div>
  <div className="mt-3 flex items-center text-sm">
    <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
      {percentChange}%
    </span>
    <span className="text-gray-500 ml-2">vs bulan lalu</span>
  </div>
</div>
```

### Data Table Pattern (Dark Theme)
```typescript
<div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
  <table className="min-w-full divide-y divide-gray-700">
    <thead className="bg-gray-900">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
          Column Header
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-700">
      {data.map(item => (
        <tr key={item.id} className="hover:bg-gray-750">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
            {item.value}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Currency Display
```typescript
// ALWAYS use formatIDR for displaying money
import { formatIDR } from '@/lib/formatters'

// Credit (income) = green
<span className="text-green-400">{formatIDR(amount)}</span>

// Debit (expense) = red
<span className="text-red-400">-{formatIDR(amount)}</span>
```

---

## COLOR SCHEME (Dark Theme)

```
Background:      bg-gray-900 (#111827)
Card Background: bg-gray-800 (#1F2937)
Card Hover:      bg-gray-750 (#243247)
Border:          border-gray-700 (#374151)
Text Primary:    text-white
Text Secondary:  text-gray-300
Text Muted:      text-gray-400
Text Disabled:   text-gray-500

Accent Blue:     text-blue-400 / bg-blue-500/20
Accent Green:    text-green-400 / bg-green-500/20 (income/positive)
Accent Red:      text-red-400 / bg-red-500/20 (expense/negative)
Accent Yellow:   text-yellow-400 / bg-yellow-500/20 (warning)
Accent Purple:   text-purple-400 / bg-purple-500/20 (credit card)
```

---

## FINANCIAL CALCULATION HELPERS

### Key Calculations (in `src/lib/calculations.ts`)

```typescript
// Net Cashflow = Total Credit - Total Debit
export function calculateNetCashflow(credits: number, debits: number): number {
  return credits - debits
}

// CC Utilization Rate
export function calculateCCUtilization(tagihan: number, limit: number): number {
  return (tagihan / limit) * 100
}

// Goal Progress
export function calculateGoalProgress(current: number, target: number): number {
  return Math.min((current / target) * 100, 100)
}

// Monthly Burn Rate (business)
export function calculateBurnRate(totalDebit: number): number {
  return totalDebit // Monthly operational cost
}

// Business Runway (months)
export function calculateRunway(balance: number, monthlyBurn: number): number {
  if (monthlyBurn === 0) return Infinity
  return balance / monthlyBurn
}
```

---

## COMMON PITFALLS

### 1. Column Name Errors
- ALWAYS verify column names in DATABASE_SCHEMA.md
- `transactions.transaction_date` NOT `transactions.date`
- `transactions.transaction_type` NOT `transactions.type`
- `credit_card_bills.total_tagihan` NOT `credit_card_bills.amount`

### 2. Period Format
- Monthly summaries use `period` as TEXT: `'2026-01'`, `'2026-02'`
- CC bills use `bill_period` as TEXT: `'2025-10'`, `'2025-11'`
- Always format as `YYYY-MM`

### 3. Amount Handling
- All amounts are NUMERIC in database (not INTEGER)
- Always parse as `parseFloat()` or `Number()` when doing math
- Use `formatIDR()` for display, raw number for calculations

### 4. FK Joins
- All FK joins use pattern: `table:accounts!{table}_account_id_fkey(...)`
- Affected tables: `transactions`, `monthly_summaries`, `credit_card_bills`, `subscriptions`, `team_payments`

### 5. Not Handling Loading States
- Always handle loading, error, and empty states in UI
- Use skeleton loaders for dashboard cards

### 6. Hard-coded Account IDs
- Use constants from a config, not hard-coded UUIDs in components
- Define in `src/lib/constants.ts`:
```typescript
export const ACCOUNT_IDS = {
  BUSINESS: 'e5297faf-0391-45de-b7f6-fa793fc28377',
  PERSONAL: 'c6faff9c-5ace-48e8-9d61-c973ce414f51',
  CREDIT_CARD: '4daff63a-a93f-4fc7-9027-429dcc1d4236',
} as const
```

---

## CODE REVIEW CHECKLIST

Before committing:
- [ ] All column names verified against DATABASE_SCHEMA.md
- [ ] Error handling with try/catch
- [ ] Loading & error states in UI
- [ ] TypeScript types (no `any`)
- [ ] UI text in Bahasa Indonesia
- [ ] No hard-coded UUIDs (use ACCOUNT_IDS constant)
- [ ] Currency displayed with `formatIDR()`
- [ ] Dark theme colors consistent
- [ ] `console.log` removed (except error logging)

---

## TYPESCRIPT TYPES (`src/types/database.ts`)

```typescript
export interface Account {
  id: string
  account_number: string
  account_name: string
  account_type: 'business' | 'personal' | 'credit_card'
  bank_name: string
  branch: string | null
  credit_limit: number | null
  current_balance: number | null
  last_updated: string | null
  created_at: string | null
}

export interface Transaction {
  id: string
  account_id: string
  transaction_date: string
  description: string
  amount: number
  transaction_type: 'credit' | 'debit'
  category: string | null
  subcategory: string | null
  is_business_expense: boolean | null
  notes: string | null
  statement_period: string | null
  created_at: string | null
  // FK join
  account?: Pick<Account, 'account_name' | 'account_type'>
}

export interface MonthlySummary {
  id: string
  account_id: string
  period: string
  opening_balance: number | null
  closing_balance: number | null
  total_credit: number | null
  total_debit: number | null
  transaction_count: number | null
  created_at: string | null
  // FK join
  account?: Pick<Account, 'account_name' | 'account_type'>
}

export interface CreditCardBill {
  id: string
  account_id: string
  bill_period: string
  total_tagihan: number
  minimum_payment: number | null
  due_date: string | null
  payment_status: 'unpaid' | 'minimum_paid' | 'full_paid' | null
  created_at: string | null
}

export interface FinancialGoal {
  id: string
  goal_name: string
  goal_type: 'emergency_fund' | 'wedding' | 'business_runway' | 'investment' | 'other'
  target_amount: number
  current_amount: number | null
  target_date: string | null
  priority: number | null
  status: 'active' | 'achieved' | 'paused' | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Subscription {
  id: string
  name: string
  amount: number
  currency: string | null
  billing_cycle: 'monthly' | 'annual'
  category: string | null
  is_business: boolean | null
  next_billing_date: string | null
  account_id: string | null
  status: 'active' | 'cancelled' | null
  created_at: string | null
}

export interface TeamPayment {
  id: string
  person_name: string
  role: string | null
  payment_type: 'salary' | 'talent_fee' | 'freelance' | 'bonus'
  amount: number
  payment_date: string
  period: string | null
  account_id: string | null
  notes: string | null
  created_at: string | null
}
```

---

## ALERT LOGIC RULES (`src/lib/alerts.ts`)

Dashboard harus menampilkan financial alerts berdasarkan rules berikut:

```typescript
interface FinancialAlert {
  type: 'danger' | 'warning' | 'info'
  title: string
  message: string
  icon: string // Lucide icon name
}

// Rule 1: Personal spending melebihi gaji
// IF personal_debit_this_month > 7_000_000 → DANGER
// "Pengeluaran personal bulan ini (Rp X) melebihi gaji (Rp 7jt)"

// Rule 2: CC utilization tinggi
// IF cc_tagihan / 20_000_000 > 0.30 → WARNING
// "Utilisasi kartu kredit {X}% — target di bawah 30%"

// Rule 3: Business runway rendah
// IF business_balance / monthly_burn < 3 → DANGER
// "Business runway hanya {X} bulan — target minimal 3 bulan"

// Rule 4: CC due date dekat
// IF cc_due_date - today < 7 days AND payment_status == 'unpaid' → DANGER
// "Tagihan CC jatuh tempo dalam {X} hari — Rp {amount}"

// Rule 5: Positive — Business net positive
// IF business_credit > business_debit → INFO (green)
// "Business cashflow positif bulan ini: +Rp {net}"
```

---

## SIDEBAR NAVIGATION

```typescript
const navigation = [
  { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { name: 'Transaksi', href: '/transactions', icon: 'ArrowLeftRight' },
  { name: 'Akun', href: '/accounts', icon: 'Wallet' },
  { name: 'Kartu Kredit', href: '/credit-card', icon: 'CreditCard' },
  { name: 'Goals', href: '/goals', icon: 'Target' },
  { name: 'Langganan', href: '/subscriptions', icon: 'Repeat' },
  { name: 'Tim & Gaji', href: '/team-payments', icon: 'Users' },
]
```

---

## CHART SPECIFICATIONS

### 1. Business Cashflow Bar Chart (`CashflowChart.tsx`)
- **Type:** Grouped bar chart (Recharts BarChart)
- **Data:** Monthly total_credit vs total_debit from `monthly_summaries` WHERE account_type = 'business'
- **X-axis:** Month (Jan, Feb, Mar...)
- **Y-axis:** Amount in IDR
- **Bars:** Green for credit, Red for debit
- **Period:** Last 6-12 months

### 2. CC Tagihan Trend Line (`CCTrendChart.tsx`)
- **Type:** Line chart (Recharts LineChart)
- **Data:** `credit_card_bills.total_tagihan` per `bill_period`
- **X-axis:** Billing period
- **Y-axis:** Tagihan amount
- **Reference line:** CC limit (Rp 20jt) as dashed red line
- **Period:** Last 6 months

### 3. Personal Spending by Category (`SpendingDonut.tsx`)
- **Type:** Donut/Pie chart (Recharts PieChart)
- **Data:** SUM(amount) from `transactions` WHERE account_type = 'personal' AND transaction_type = 'debit', GROUP BY category
- **Colors:** Different color per category
- **Center text:** Total spending amount

### 4. Monthly Comparison (`MonthlyCompare.tsx`)
- **Type:** Comparison cards or side-by-side bars
- **Data:** This month vs last month for each account
- **Metrics:** Total credit, total debit, net cashflow, closing balance

---

## REFERENCES

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/en-US/api)
- [Lucide Icons](https://lucide.dev/icons)
- [date-fns](https://date-fns.org/docs)

---

**Last Updated:** 2026-03-22
