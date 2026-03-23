'use client'

import { useAccountMode } from '@/hooks/useAccountMode'

export default function ModeToggle() {
  const { mode, setMode, loaded } = useAccountMode()

  if (!loaded) return null

  return (
    <div className="flex justify-center mb-4">
      <div className="flex gap-1 bg-slate-800 rounded-full p-1">
        <button
          onClick={() => setMode('personal')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            mode === 'personal'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Personal
        </button>
        <button
          onClick={() => setMode('business')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            mode === 'business'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Business
        </button>
      </div>
    </div>
  )
}
