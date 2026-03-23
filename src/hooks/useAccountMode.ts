'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import React from 'react'

export type AccountMode = 'personal' | 'business'

interface AccountModeContextType {
  mode: AccountMode
  setMode: (mode: AccountMode) => void
  loaded: boolean
  accountTypes: string[]
  accountTypeParam: string
}

const AccountModeContext = createContext<AccountModeContextType>({
  mode: 'personal',
  setMode: () => {},
  loaded: false,
  accountTypes: ['personal', 'credit_card'],
  accountTypeParam: 'personal,credit_card',
})

export function AccountModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AccountMode>('personal')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ican-account-mode') as AccountMode | null
    if (saved && (saved === 'personal' || saved === 'business')) {
      setModeState(saved)
    }
    setLoaded(true)
  }, [])

  const setMode = (newMode: AccountMode) => {
    setModeState(newMode)
    localStorage.setItem('ican-account-mode', newMode)
  }

  const accountTypes = mode === 'personal' ? ['personal', 'credit_card'] : ['business']
  const accountTypeParam = accountTypes.join(',')

  return React.createElement(
    AccountModeContext.Provider,
    { value: { mode, setMode, loaded, accountTypes, accountTypeParam } },
    children
  )
}

export function useAccountMode() {
  return useContext(AccountModeContext)
}
