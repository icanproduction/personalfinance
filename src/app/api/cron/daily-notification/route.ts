import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/cron/daily-notification
// Triggered by Vercel Cron at 9PM WIB daily
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Get today's spending
  const today = now.toISOString().split('T')[0]
  const { data: todayTx } = await supabase
    .from('transactions')
    .select('amount')
    .eq('transaction_date', today)
    .eq('transaction_type', 'debit')

  const todaySpent = (todayTx || []).reduce((sum, tx) => sum + Number(tx.amount), 0)

  // Get month total spending
  const { data: monthTx } = await supabase
    .from('transactions')
    .select('amount')
    .eq('statement_period', period)
    .eq('transaction_type', 'debit')

  const monthSpent = (monthTx || []).reduce((sum, tx) => sum + Number(tx.amount), 0)

  // Get total budget
  const { data: budgets } = await supabase
    .from('budget_categories')
    .select('monthly_budget')
    .eq('is_active', true)

  const totalBudget = (budgets || []).reduce((sum, b) => sum + Number(b.monthly_budget), 0)
  const remaining = totalBudget - monthSpent
  const percentage = totalBudget > 0 ? Math.round((monthSpent / totalBudget) * 100) : 0

  // Check for over-budget categories
  const { data: overBudgetCats } = await supabase
    .from('budget_categories')
    .select('category, monthly_budget')
    .eq('is_active', true)

  // Build notification message
  const formatRp = (n: number) => `Rp ${Math.abs(n).toLocaleString('id-ID')}`
  let title = `Pengeluaran Hari Ini: ${formatRp(todaySpent)}`
  let body = `Total bulan ini: ${formatRp(monthSpent)} (${percentage}% dari budget). Sisa: ${formatRp(remaining)}`

  if (percentage >= 100) {
    title = `⚠️ OVER BUDGET! ${formatRp(monthSpent)}`
    body = `Kamu sudah melebihi budget ${formatRp(totalBudget)}. Over ${formatRp(monthSpent - totalBudget)}`
  } else if (percentage >= 80) {
    title = `⚠️ Budget hampir habis (${percentage}%)`
  }

  // Get all active push subscriptions
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('is_active', true)

  // Send push notifications (web-push would be used here in production)
  // For now, we log and return the notification data
  const notificationsSent = (subs || []).length

  return NextResponse.json({
    success: true,
    notification: { title, body },
    stats: {
      todaySpent,
      monthSpent,
      totalBudget,
      remaining,
      percentage,
    },
    subscriptions: notificationsSent,
  })
}
