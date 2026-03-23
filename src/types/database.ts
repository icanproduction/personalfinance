// ============================================
// iCAN Financial - TypeScript Types
// ============================================

export interface Account {
  id: string
  account_number: string
  account_name: string
  account_type: 'business' | 'personal' | 'credit_card'
  bank_name: string
  branch: string | null
  credit_limit: number
  current_balance: number
  last_updated: string
  created_at: string
}

export interface Transaction {
  id: string
  account_id: string
  transaction_date: string
  description: string
  amount: number
  transaction_type: 'credit' | 'debit'
  category: string
  subcategory: string | null
  is_business_expense: boolean
  notes: string | null
  statement_period: string | null
  category_confidence: number
  auto_categorized: boolean
  bca_sync_id: string | null
  created_at: string
  // Joined
  account?: Pick<Account, 'account_name' | 'account_type'>
}

export interface MonthlySummary {
  id: string
  account_id: string
  period: string
  opening_balance: number
  closing_balance: number
  total_credit: number
  total_debit: number
  transaction_count: number
  created_at: string
}

export interface CreditCardBill {
  id: string
  account_id: string
  bill_period: string
  total_tagihan: number
  minimum_payment: number
  due_date: string | null
  payment_status: 'unpaid' | 'minimum_paid' | 'full_paid'
  created_at: string
}

export interface FinancialGoal {
  id: string
  goal_name: string
  goal_type: 'emergency_fund' | 'wedding' | 'business_runway' | 'investment' | 'other'
  target_amount: number
  current_amount: number
  target_date: string | null
  priority: number
  status: 'active' | 'achieved' | 'paused'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  name: string
  amount: number
  currency: string
  billing_cycle: 'monthly' | 'annual'
  category: string
  is_business: boolean
  next_billing_date: string | null
  account_id: string | null
  status: 'active' | 'cancelled'
  created_at: string
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
  created_at: string
}

export interface BudgetCategory {
  id: string
  category: string
  monthly_budget: number
  warning_threshold: number
  icon: string
  color: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BcaSyncLog {
  id: string
  sync_date: string
  transactions_found: number
  transactions_new: number
  transactions_duplicate: number
  status: 'success' | 'partial' | 'failed'
  error_message: string | null
  created_at: string
}

export interface PushSubscription {
  id: string
  endpoint: string
  p256dh: string
  auth: string
  device_label: string | null
  is_active: boolean
  created_at: string
}

// ============================================
// Budget Status (computed)
// ============================================

export interface BudgetStatus {
  category: string
  monthly_budget: number
  spent: number
  remaining: number
  percentage: number
  status: 'safe' | 'warning' | 'over'
  icon: string
  color: string
  warning_threshold: number
}

export interface DashboardData {
  totalSpentThisMonth: number
  totalIncomeThisMonth: number
  totalBudget: number
  budgetStatuses: BudgetStatus[]
  recentTransactions: Transaction[]
  daysLeft: number
  dailyBudgetRemaining: number
}

// ============================================
// Category labels (Indonesian)
// ============================================

export const CATEGORY_LABELS: Record<string, string> = {
  food_beverage: 'Makan & Minum',
  transport: 'Transport',
  coffee: 'Kopi',
  subscription: 'Langganan',
  shopping: 'Belanja',
  entertainment: 'Hiburan',
  transfer_in: 'Transfer Masuk',
  transfer_out: 'Transfer Keluar',
  payment: 'Pembayaran',
  salary: 'Gaji',
  talent_fee: 'Talent Fee',
  business_equipment: 'Peralatan Bisnis',
  other: 'Lainnya',
  uncategorized: 'Belum Dikategorikan',
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category
}
