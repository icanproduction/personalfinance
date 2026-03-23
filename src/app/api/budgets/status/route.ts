import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/budgets/status?period=2026-03&account_type=personal,credit_card
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const now = new Date()
  const period = searchParams.get('period') ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const accountTypeParam = searchParams.get('account_type')

  // Resolve account IDs from account_type filter
  let accountIds: string[] | null = null
  if (accountTypeParam) {
    const accountTypes = accountTypeParam.split(',').map(t => t.trim())
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id')
      .in('account_type', accountTypes)
    accountIds = (accounts || []).map(a => a.id)
  }

  // 1. Get all active budget categories
  const { data: budgets, error: budgetError } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (budgetError) {
    return NextResponse.json({ error: budgetError.message }, { status: 500 })
  }

  // 2. Get spending per category for the period (debit only)
  let spendingQuery = supabase
    .from('transactions')
    .select('category, amount')
    .eq('statement_period', period)
    .eq('transaction_type', 'debit')

  if (accountIds) {
    spendingQuery = spendingQuery.in('account_id', accountIds)
  }

  const { data: spending, error: spendingError } = await spendingQuery

  if (spendingError) {
    return NextResponse.json({ error: spendingError.message }, { status: 500 })
  }

  // 3. Aggregate spending by category
  const spendingMap: Record<string, number> = {}
  let totalSpent = 0

  for (const tx of spending || []) {
    const cat = tx.category || 'uncategorized'
    spendingMap[cat] = (spendingMap[cat] || 0) + Number(tx.amount)
    totalSpent += Number(tx.amount)
  }

  // 4. Get total income (credit) for the period
  let incomeQuery = supabase
    .from('transactions')
    .select('amount')
    .eq('statement_period', period)
    .eq('transaction_type', 'credit')

  if (accountIds) {
    incomeQuery = incomeQuery.in('account_id', accountIds)
  }

  const { data: income } = await incomeQuery

  const totalIncome = (income || []).reduce((sum, tx) => sum + Number(tx.amount), 0)

  // 5. Build budget status array
  let totalBudget = 0
  const statuses = (budgets || []).map((b) => {
    const spent = spendingMap[b.category] || 0
    const remaining = b.monthly_budget - spent
    const percentage = b.monthly_budget > 0 ? Math.round((spent / b.monthly_budget) * 100) : 0
    totalBudget += b.monthly_budget

    let status: 'safe' | 'warning' | 'over' = 'safe'
    if (percentage >= 100) status = 'over'
    else if (percentage >= b.warning_threshold * 100) status = 'warning'

    return {
      category: b.category,
      monthly_budget: b.monthly_budget,
      spent,
      remaining,
      percentage,
      status,
      icon: b.icon,
      color: b.color,
      warning_threshold: b.warning_threshold,
    }
  })

  // 6. Calculate days remaining
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysLeft = lastDay.getDate() - now.getDate()
  const dailyBudgetRemaining = daysLeft > 0 ? (totalBudget - totalSpent) / daysLeft : 0

  return NextResponse.json({
    period,
    totalSpent,
    totalIncome,
    totalBudget,
    daysLeft,
    dailyBudgetRemaining,
    statuses,
  })
}
