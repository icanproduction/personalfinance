// ============================================
// Formatting Utilities
// ============================================

/**
 * Format number as Indonesian Rupiah
 * e.g., 1500000 → "Rp 1.500.000"
 */
export function formatRupiah(amount: number, showSign = false): string {
  const prefix = showSign && amount > 0 ? '+' : ''
  const formatted = Math.abs(amount).toLocaleString('id-ID')
  return `${prefix}Rp ${formatted}`
}

/**
 * Short format for large numbers
 * e.g., 1500000 → "1,5jt", 500000 → "500rb"
 */
export function formatShort(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000_000) return `${(abs / 1_000_000_000).toFixed(1).replace('.0', '')}M`
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1).replace('.0', '')}jt`
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(0)}rb`
  return abs.toString()
}

/**
 * Format date as "22 Mar 2026"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format date as "22 Mar"
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Get current month period string "YYYY-MM"
 */
export function getCurrentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Format period "2026-03" → "Maret 2026"
 */
export function formatPeriod(period: string): string {
  const [year, month] = period.split('-')
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return `${months[parseInt(month) - 1]} ${year}`
}

/**
 * Get days remaining in current month
 */
export function getDaysRemaining(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return lastDay.getDate() - now.getDate()
}

/**
 * Get percentage and clamp to 0-100+
 */
export function getPercentage(spent: number, budget: number): number {
  if (budget <= 0) return 0
  return Math.round((spent / budget) * 100)
}
