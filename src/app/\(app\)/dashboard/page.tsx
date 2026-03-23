'use client'

import { useState, useEffect } from 'react'
import { Plus, ChevronLeft, ChevronRight, TrendingDown, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatRupiah, formatShort, formatPeriod, getCurrentPeriod, getDaysRemaining } from '@/lib/format'
import { getCategoryLabel } from '@/types/database'
import { useAccountMode } from '@/hooks/useAccountMode'
import type { BudgetStatus, Transaction } from '@/types/database'
import ModeToggle from '@/components/ui/ModeToggle'
import BudgetBar from '@/components/ui/BudgetBar'
import TransactionItem from '@/components/ui/TransactionItem'
import AddTransactionSheet from '@/components/ui/AddTransactionSheet'

interface DashboardState {
  totalSpent: number
  totalIncome: number
  totalBudget: number
  daysLeft: number
  dailyBudgetRemaining: number
  budgetStatuses: BudgetStatus[]
  recentTransactions: Transaction[]
  loading: boolean
}

export default function DashboardPage() {
  const [period, setPeriod] = useState(getCurrentPeriod())
  const [state, setState] = useState<DashboardState>({
    totalSpent: 0,
    totalIncome: 0,
    totalBudget: 0,
    daysLeft: 0,
    dailyBudgetRemaining: 0,
    budgetStatuses: [],
    recentTransactions: [],
    loading: true,
  })
  const [showAdd, setShowAdd] = useState(false)
  const { mode, loaded, accountTypes } = useAccountMode()

  const loadData = async () => {
    setState((s) => ({ ...s, loading: true }))

    // Load budget status
    const accountTypesParam = accountTypes.join(',')
    const budgetRes = await fetch(`/api/budgets/status?period=${period}&account_type=${accountTypesParam}`)
    const budgetData = await budgetRes.json()

    // Load recent transactions
    const { data: txData } = await supabase
      .from('transactions')
      .select('*, account:accounts!transactions_account_id_fkey(account_name, account_type)')
      .eq('statement_period', period)
      .in('account.account_type', accountTypes)
      .order('transaction_date', { ascending: false })
      .limit(5)

    setState({
      totalSpent: budgetData.totalSpent || 0,
      totalIncome: budgetData.totalIncome || 0,
      totalBudget: budgetData.totalBudget || 0,
      daysLeft: budgetData.daysLeft || 0,
      dailyBudgetRemaining: budgetData.dailyBudgetRemaining || 0,
      budgetStatuses: budgetData.statuses || [],
      recentTransactions: txData || [],
      loading: false,
    })
  }

  useEffect(() => {
    if (loaded) {
      loadData()
    }
  }, [period, mode, loaded])

  const navigateMonth = (dir: -1 | 1) => {
    const [y, m] = period.split('-').map(Number)
    const d = new Date(y, m - 1 + dir, 1)
    setPeriod(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const handleAddTransaction = async (data: any) => {
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    loadData()
  }

  const remaining = state.totalBudget - state.totalSpent
  const overallPercent = state.totalBudget > 0 ? Math.round((state.totalSpent / state.totalBudget) * 100) : 0
  const isOverBudget = overallPercent >= 100
  const isWarning = overallPercent >= 80

  const warningBudgets = state.budgetStatuses.filter((b) => b.status === 'warning' || b.status === 'over')

  if (!loaded) {
    return (
      <div className="px-4 pt-6 flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs text-slate-400 font-medium">{mode === 'personal' ? 'Mode Personal' : 'Mode Business'}</h2>
        <ModeToggle />
      </div>

      {/* Month Picker */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigateMonth(-1)} className="p-2 text-slate-400 active:text-white">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-white">{formatPeriod(period)}</h1>
        <button onClick={() => navigateMonth(1)} className="p-2 text-slate-400 active:text-white">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Loading */}
      {state.loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Main Spending Card */}
          <div className={`rounded-2xl p-5 mb-4 ${
            isOverBudget ? 'bg-red-500/10 border border-red-500/20' :
            isWarning ? 'bg-amber-500/10 border border-amber-500/20' :
            'bg-slate-800/50 border border-slate-700/50'
          }`}>
            <p className="text-xs text-slate-400 mb-1">Total Pengeluaran</p>
            <p className={`text-3xl font-bold mb-1 ${
              isOverBudget ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'
            }`}>
              {formatRupiah(state.totalSpent)}
            </p>
            <p className="text-xs text-slate-500">
              dari budget {formatRupiah(state.totalBudget)}
            </p>

            {/* Progress bar */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mt-3 mb-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isOverBudget ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(overallPercent, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs">
              <span className={`font-medium ${
                isOverBudget ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-indigo-400'
              }`}>
                {overallPercent}%
              </span>
              <span className="text-slate-400">
                {remaining >= 0 ? `Sisa ${formatShort(remaining)}` : `Over ${formatShort(Math.abs(remaining))}`}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-xs text-slate-400">Sisa hari</span>
              </div>
              <p className="text-lg font-bold text-white">{state.daysLeft} hari</p>
              <p className="text-[10px] text-slate-500">
                {formatShort(state.dailyBudgetRemaining)}/hari
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown size={14} className="text-emerald-400" />
                <span className="text-xs text-slate-400">Pemasukan</span>
              </div>
              <p className="text-lg font-bold text-emerald-400">{formatShort(state.totalIncome)}</p>
              <p className="text-[10px] text-slate-500">bulan ini</p>
            </div>
          </div>

          {/* Budget Warnings */}
          {warningBudgets.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-medium text-slate-300 mb-2">Perlu Perhatian</h2>
              <div className="space-y-1">
                {warningBudgets.map((b) => (
                  <BudgetBar key={b.category} budget={b} compact />
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-medium text-slate-300">Transaksi Terakhir</h2>
              <a href="/transactions" className="text-xs text-indigo-400">Lihat semua</a>
            </div>
            {state.recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Belum ada transaksi</p>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {state.recentTransactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* FAB - Add Transaction */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 active:bg-indigo-700 transition-colors z-40"
      >
        <Plus size={24} className="text-white" />
      </button>

      <AddTransactionSheet
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  )
}
