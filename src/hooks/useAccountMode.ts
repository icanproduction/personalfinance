import { useState, useEffect } from 'react'

export type AccountMode = 'personal' | 'business'

export function useAccountMode() {
  const [mode, setMode] = useState<AccountMode>('personal')
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ican-account-mode') as AccountMode | null
    if (saved && (saved === 'personal' || saved === 'business')) {
      setMode(saved)
    }
    setLoaded(true)
  }, [])

  // Save to localStorage when mode changes
  const updateMode = (newMode: AccountMode) => {
    setMode(newMode)
    localStorage.setItem('ican-account-mode', newMode)
  }

  // Get account types for current mode
  const getAccountTypes = (): string[] => {
    if (mode === 'personal') {
      return ['personal', 'credit_card'] // Personal mode shows personal + credit card
    } else {
      return ['business'] // Business mode shows business only
    }
  }

  return {
    mode,
    setMode: updateMode,
    loaded,
    accountTypes: getAccountTypes(),
  }
}
