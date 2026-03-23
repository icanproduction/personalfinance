'use client'

import BottomNav from '@/components/layout/BottomNav'
import { AccountModeProvider } from '@/hooks/useAccountMode'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountModeProvider>
      <div className="min-h-screen bg-slate-950">
        <main className="pb-20 max-w-lg mx-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </AccountModeProvider>
  )
}
