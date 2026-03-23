import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { categorizeTransaction } from '@/lib/categories'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/transactions?period=2026-03&account_id=xxx&category=food&account_type=personal,credit_card
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period')
  const accountId = searchParams.get('account_id')
  const category = searchParams.get('category')
  const accountTypeParam = searchParams.get('account_type')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

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

  let query = supabase
    .from('transactions')
    .select('*, account:accounts!transactions_account_id_fkey(account_name, account_type)', { count: 'exact' })
    .order('transaction_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (period) {
    query = query.eq('statement_period', period)
  }
  if (accountId) {
    query = query.eq('account_id', accountId)
  }
  if (category) {
    query = query.eq('category', category)
  }
  if (accountIds) {
    query = query.in('account_id', accountIds)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count })
}

// POST /api/transactions - Manual add
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { account_id, transaction_date, description, amount, transaction_type, category, notes } = body

  // Auto-categorize if no category provided
  let finalCategory = category
  let confidence = 0
  let autoCategorized = false

  if (!finalCategory || finalCategory === 'uncategorized') {
    const result = categorizeTransaction(description)
    finalCategory = result.category
    confidence = result.confidence
    autoCategorized = result.auto_categorized
  }

  const period = transaction_date?.substring(0, 7) // "YYYY-MM"

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      account_id,
      transaction_date,
      description,
      amount: Math.abs(amount),
      transaction_type: transaction_type || 'debit',
      category: finalCategory,
      category_confidence: confidence,
      auto_categorized: autoCategorized,
      statement_period: period,
      notes,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
