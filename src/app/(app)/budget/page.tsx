'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Check, X } from 'lucide-react'
import { formatRupiah, formatShort, formatPeriod, getCurrentPeriod } from '@/lib/format'
import { getCategoryLabel } from '@/types/database'
import type { BudgetStatus } from '@/types/database'
import BudgetBar from '@/components/ui/BudgetBar'
import ModeToggle from '@/components/ui/ModeToggle'
import { useAccountMode } from '@/hooks/useAccountMode'

export default function BudgetPage() {
  const [period, setPeriod] = useState(getCurrentPeriod())
  const { mode, accountTypeParam, loaded } = useAccountMode()
  const [statuses, setStatuses] = useState<BudgetStatus[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [totalBudget, setTotalBudget] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const loadBudgets = async () => {
    setLoading(true)
    const res = await fetch(`/api/budgets/status?period=${period}&account_type=${accountTypeParam}`)
    const data = await res.json()
    setStatuses(data.statuses || [])
    setTotalSpent(data.totalSpent || 0)
    setTotalBudget(data.totalBudget || 0)
    setLoading(false)
  }

  useEffect(() => {
    if (loaded) loadBudgets()
  }, [period, mode, loaded])

  const navigateMonth = (dir: -1 | 1) => {
    const [y, m] = period.split('-').map(Number)
    const d = new Date(y, m - 1 + dir, 1)
    setPeriod(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const startEdit = (category: string, currentBudget: number) => {
    setEditingId(category)
    setEditValue(String(currentBudget))
  }

  const saveEdit = async (category: string) => {
    const budgetRes = await fetch('/api/budgets')
    const { data: budgets } = await budgetRes.json()
    const budget = budgets?.find((b: any) => b.category === category)
    if (!budget) return

    await fetch('/api/budgets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: budget.id,
        monthly_budget: parseFloat(editValue),
        warning_threshold: budget.warning_threshold,
      }),
    })
    setEditingId(null)
    loadBudgets()
  }

  const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return (
    <div className="px-4 pt-6">
      {/* Mode Toggle */}
      <ModeToggle />

      {/* Month Picker */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigateMonth(-1)} className="p-2 text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-white">{formatPeriod(period)}</h1>
        <button onClick={() => navigateMonth(1)} className="p-2 text-slate-400">
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-slate-800/50 rounded-2xl p-4 mb-5">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-slate-400">Total Budget</p>
                <p className="text-xl font-bold text-white">{formatRupiah(totalBudget)}</p>
              </div>
              <p className="text-sm text-slate-400">
                Terpakai <span className="text-white font-medium">{overallPercent}%</span>
              </p>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  overallPercent >= 100 ? 'bg-red-500' :
                  overallPercent >= 80 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(overallPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Category List */}
          <h2 className="text-sm font-medium text-slate-300 mb-3">Per Kategori</h2>
          <div className="space-y-3">
            {statuses.map((b) => (
              <div key={b.category} className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {getCategoryLabel(b.category)}
                    </p>
                    {editingId === b.category ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-slate-700 text-white text-xs rounded px-2 py-1 w-32 focus:outline-none"
                          inputMode="numeric"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(b.category)} className="text-emerald-400">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatShort(b.spent)} / {formatShort(b.monthly_budget)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      b.status === 'over' ? 'text-red-400' :
                      b.status === 'warning' ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {b.percentage}%
                    </span>
                    {editingId !== b.category && (
                      <button
                        onClick={() => startEdit(b.category, b.monthly_budget)}
                        className="p-1 text-slate-500 active:text-slate-300"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.status === 'over' ? 'bg-red-500' :
                      b.status === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>
                {b.status === 'over' && (
                  <p className="text-xs text-red-400 mt-1.5">Over {formatShort(Math.abs(b.remaining))}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
