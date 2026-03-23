'use client'

import { getCategoryLabel } from '@/types/database'
import { formatRupiah, formatDateShort } from '@/lib/format'
import type { Transaction } from '@/types/database'

interface TransactionItemProps {
  transaction: Transaction
  onTap?: () => void
}

export default function TransactionItem({ transaction: tx, onTap }: TransactionItemProps) {
  const isCredit = tx.transaction_type === 'credit'

  return (
    <div
      className="flex items-center gap-3 py-3 px-1 active:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
      onClick={onTap}
    >
      {/* Category dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        isCredit ? 'bg-emerald-400' : 'bg-red-400'
      }`} />

      {/* Description & category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{tx.description}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {getCategoryLabel(tx.category)} · {formatDateShort(tx.transaction_date)}
        </p>
      </div>

      {/* Amount */}
      <span className={`text-sm font-medium flex-shrink-0 ${
        isCredit ? 'text-emerald-400' : 'text-white'
      }`}>
        {isCredit ? '+' : '-'}{formatRupiah(tx.amount)}
      </span>
    </div>
  )
}
