'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'
import { formatPeriod, getCurrentPeriod, formatRupiah } from '@/lib/format'
import { getCategoryLabel } from '@/types/database'
import { getAllCategories } from '@/lib/categories'
import type { Transaction } from '@/types/database'
import TransactionItem from '@/components/ui/TransactionItem'
import ModeToggle from '@/components/ui/ModeToggle'
import { useAccountMode } from '@/hooks/useAccountMode'

export default function TransactionsPage() {
  const [period, setPeriod] = useState(getCurrentPeriod())
  const { mode, accountTypeParam, loaded } = useAccountMode()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [showFilter, setShowFilter] = useState(false)
  const [totalDebit, setTotalDebit] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)

  const loadTransactions = useCallback(async () => {
    if (!loaded) return
    setLoading(true)

    let url = `/api/transactions?period=${period}&account_type=${accountTypeParam}&limit=100`
    if (filterCategory) {
      url += `&category=${filterCategory}`
    }

    const res = await fetch(url)
    const { data } = await res.json()
    let txs: Transaction[] = data || []

    // Client-side search filter
    if (search) {
      const s = search.toLowerCase()
      txs = txs.filter(t => t.description?.toLowerCase().includes(s))
    }

    setTransactions(txs)

    const debit = txs.filter(t => t.transaction_type === 'debit').reduce((s, t) => s + Number(t.amount), 0)
    const credit = txs.filter(t => t.transaction_type === 'credit').reduce((s, t) => s + Number(t.amount), 0)
    setTotalDebit(debit)
    setTotalCredit(credit)
    setLoading(false)
  }, [period, mode, loaded, filterCategory, search, accountTypeParam])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const navigateMonth = (dir: -1 | 1) => {
    const [y, m] = period.split('-').map(Number)
    const d = new Date(y, m - 1 + dir, 1)
    setPeriod(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  // Group by date
  const grouped: Record<string, Transaction[]> = {}
  for (const tx of transactions) {
    const d = tx.transaction_date
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(tx)
  }

  return (
    <div className="px-4 pt-6">
      {/* Mode Toggle */}
      <ModeToggle />

      {/* Month Picker */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigateMonth(-1)} className="p-2 text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-white">{formatPeriod(period)}</h1>
        <button onClick={() => navigateMonth(1)} className="p-2 text-slate-400">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-red-500/10 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-400">Keluar</p>
          <p className="text-sm font-bold text-red-400">{formatRupiah(totalDebit)}</p>
        </div>
        <div className="flex-1 bg-emerald-500/10 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-400">Masuk</p>
          <p className="text-sm font-bold text-emerald-400">{formatRupiah(totalCredit)}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2 rounded-lg border ${
            filterCategory
              ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          <Filter size={18} />
        </button>
      </div>

      {/* Filter chips */}
      {showFilter && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterCategory('')}
            className={`px-3 py-1 rounded-full text-xs ${
              !filterCategory ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Semua
          </button>
          {getAllCategories().map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs ${
                filterCategory === cat ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      )}

      {/* Transaction List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-center text-slate-500 text-sm py-20">Tidak ada transaksi</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs text-slate-500 mb-1 sticky top-0 bg-slate-950 py-1">
                {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
              <div className="divide-y divide-slate-800/50">
                {txs.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
