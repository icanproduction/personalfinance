import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { categorizeTransaction } from '@/lib/categories'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Personal account ID
const PERSONAL_ACCOUNT_ID = 'c6faff9c-5ace-48e8-9d61-c973ce414f51'

interface BcaTransaction {
  date: string // YYYY-MM-DD
  description: string
  amount: number
  type: 'credit' | 'debit'
}

// POST /api/bca-sync - Receive transactions from Chrome extension
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { transactions, account_id }: { transactions: BcaTransaction[], account_id?: string } = body

  if (!transactions || !Array.isArray(transactions)) {
    return NextResponse.json({ error: 'transactions array required' }, { status: 400 })
  }

  const targetAccountId = account_id || PERSONAL_ACCOUNT_ID

  // 1. Create sync log
  const { data: syncLog } = await supabase
    .from('bca_sync_logs')
    .insert({
      transactions_found: transactions.length,
      transactions_new: 0,
      transactions_duplicate: 0,
    })
    .select()
    .single()

  let newCount = 0
  let dupeCount = 0

  for (const tx of transactions) {
    // 2. Check for duplicates (same date + amount + description)
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('account_id', targetAccountId)
      .eq('transaction_date', tx.date)
      .eq('amount', Math.abs(tx.amount))
      .eq('description', tx.description)
      .limit(1)

    if (existing && existing.length > 0) {
      dupeCount++
      continue
    }

    // 3. Auto-categorize
    const catResult = categorizeTransaction(tx.description)
    const period = tx.date.substring(0, 7)

    // 4. Insert
    await supabase.from('transactions').insert({
      account_id: targetAccountId,
      transaction_date: tx.date,
      description: tx.description,
      amount: Math.abs(tx.amount),
      transaction_type: tx.type,
      category: catResult.category,
      category_confidence: catResult.confidence,
      auto_categorized: catResult.auto_categorized,
      statement_period: period,
      bca_sync_id: syncLog?.id,
    })

    newCount++
  }

  // 5. Update sync log
  if (syncLog) {
    await supabase
      .from('bca_sync_logs')
      .update({
        transactions_new: newCount,
        transactions_duplicate: dupeCount,
        status: 'success',
      })
      .eq('id', syncLog.id)
  }

  return NextResponse.json({
    success: true,
    found: transactions.length,
    new: newCount,
    duplicate: dupeCount,
    sync_id: syncLog?.id,
  })
}
