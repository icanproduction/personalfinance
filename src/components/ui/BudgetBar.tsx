'use client'

import { getCategoryLabel } from '@/types/database'
import { formatShort } from '@/lib/format'
import type { BudgetStatus } from '@/types/database'

interface BudgetBarProps {
  budget: BudgetStatus
  compact?: boolean
}

export default function BudgetBar({ budget, compact = false }: BudgetBarProps) {
  const barColor =
    budget.status === 'over' ? 'bg-red-500' :
    budget.status === 'warning' ? 'bg-amber-500' :
    'bg-indigo-500'

  const textColor =
    budget.status === 'over' ? 'text-red-400' :
    budget.status === 'warning' ? 'text-amber-400' :
    'text-slate-400'

  const percentage = Math.min(budget.percentage, 100)

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-300 truncate">
              {getCategoryLabel(budget.category)}
            </span>
            <span className={`text-xs font-medium ${textColor}`}>
              {budget.percentage}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-medium text-white">
            {getCategoryLabel(budget.category)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatShort(budget.spent)} / {formatShort(budget.monthly_budget)}
          </p>
        </div>
        <span className={`text-sm font-bold ${textColor}`}>
          {budget.percentage}%
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {budget.status === 'over' && (
        <p className="text-xs text-red-400 mt-1.5">
          Over {formatShort(Math.abs(budget.remaining))}!
        </p>
      )}
      {budget.status === 'warning' && (
        <p className="text-xs text-amber-400 mt-1.5">
          Sisa {formatShort(budget.remaining)}
        </p>
      )}
    </div>
  )
}
