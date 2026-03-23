'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Wallet, ListOrdered, Settings } from 'lucide-react'
import { useAccountMode } from '@/hooks/useAccountMode'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/transactions', label: 'Transaksi', icon: ListOrdered },
  { href: '/settings', label: 'Setting', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { mode, loaded } = useAccountMode()

  if (!loaded) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                isActive
                  ? 'text-indigo-400'
                  : 'text-slate-500 active:text-slate-300'
              }`}
              title={`${item.label} (${mode})`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
