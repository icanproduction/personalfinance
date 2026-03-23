import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/budgets - Get all budget categories
export async function GET() {
  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// PUT /api/budgets - Update a budget category
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, monthly_budget, warning_threshold } = body

  const { data, error } = await supabase
    .from('budget_categories')
    .update({ monthly_budget, warning_threshold })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
