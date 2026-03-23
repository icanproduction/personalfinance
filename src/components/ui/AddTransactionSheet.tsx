'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { getAllCategories } from '@/lib/categories'
import { getCategoryLabel } from '@/types/database'

interface AddTransactionSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    description: string
    amount: number
    category: string
    transaction_type: 'credit' | 'debit'
    transaction_date: string
    account_id: string
    notes: string
  }) => void
}

const PERSONAL_ACCOUNT_ID = 'c6faff9c-5ace-48e8-9d61-c973ce414f51'
const BUSINESS_ACCOUNT_ID = 'e5297faf-0391-45de-b7f6-fa793fc28377'

export default function AddTransactionSheet({ isOpen, onClose, onSubmit }: AddTransactionSheetProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('uncategorized')
  const [txType, setTxType] = useState<'debit' | 'credit'>('debit')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [account, setAccount] = useState<'personal' | 'business'>('personal')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!description || !amount) return
    setLoading(true)
    await onSubmit({
      description,
      amount: parseFloat(amount),
      category,
      transaction_type: txType,
      transaction_date: date,
      account_id: account === 'personal' ? PERSONAL_ACCOUNT_ID : BUSINESS_ACCOUNT_ID,
      notes,
    })
    setLoading(false)
    // Reset
    setDescription('')
    setAmount('')
    setCategory('uncategorized')
    setNotes('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-slate-900 rounded-t-2xl p-5 pb-8 animate-slideUp">
        {/* Handle */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-white">Tambah Transaksi</h2>
          <button onClick={onClose} className="p-1 text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTxType('debit')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              txType === 'debit'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setTxType('credit')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              txType === 'credit'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            Pemasukan
          </button>
        </div>

        {/* Amount */}
        <div className="mb-3">
          <label className="text-xs text-slate-400 mb-1 block">Jumlah (Rp)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-indigo-500"
            inputMode="numeric"
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="text-xs text-slate-400 mb-1 block">Deskripsi</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Makan siang, grab, dll"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category + Date row */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1 block">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {getAllCategories().map((cat) => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1 block">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Account toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAccount('personal')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              account === 'personal'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setAccount('business')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              account === 'business'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            Business
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !description || !amount}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 active:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}
