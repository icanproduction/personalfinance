// ============================================
// iCAN Financial - BCA Content Script
// ============================================
// Scrapes transaction data from https://mybca.bca.co.id/activity

(function () {
  'use strict'

  const API_URL_KEY = 'ican_api_url'
  const DEFAULT_API_URL = 'https://ican-financial.vercel.app'

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'scrapeTransactions') {
      scrapeAndSync().then(sendResponse)
      return true // async response
    }
    if (msg.action === 'getStatus') {
      sendResponse({ ready: isOnTransactionPage() })
      return true
    }
  })

  function isOnTransactionPage() {
    return window.location.href.includes('mybca.bca.co.id/activity')
  }

  async function scrapeAndSync() {
    try {
      const transactions = scrapeTransactionTable()
      if (transactions.length === 0) {
        return { success: false, error: 'Tidak ada transaksi ditemukan. Pastikan kamu ada di halaman Activity.' }
      }

      // Get API URL from storage
      const { [API_URL_KEY]: apiUrl } = await chrome.storage.sync.get(API_URL_KEY)
      const baseUrl = apiUrl || DEFAULT_API_URL

      // Send to API
      const res = await fetch(`${baseUrl}/api/bca-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || 'API error' }
      }

      return {
        success: true,
        found: data.found,
        new: data.new,
        duplicate: data.duplicate,
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  function scrapeTransactionTable() {
    const transactions = []
    const currentYear = new Date().getFullYear()

    // Try multiple selectors for BCA's transaction table
    const rows = document.querySelectorAll(
      'table tbody tr, [data-testid*="transaction"], .transaction-item, .activity-list-item'
    )

    for (const row of rows) {
      try {
        const cells = row.querySelectorAll('td')
        if (cells.length < 3) continue

        // Try to extract date, description, amount
        const dateText = cells[0]?.textContent?.trim() || ''
        const desc = cells[1]?.textContent?.trim() || ''
        const amountText = cells[2]?.textContent?.trim() || cells[3]?.textContent?.trim() || ''

        if (!dateText || !desc) continue

        // Parse date (BCA format: "DD/MM/YYYY" or "DD MMM YYYY")
        const date = parseBcaDate(dateText, currentYear)
        if (!date) continue

        // Parse amount and determine type
        const { amount, type } = parseBcaAmount(amountText)
        if (amount === 0) continue

        transactions.push({
          date,
          description: desc.replace(/\s+/g, ' ').trim(),
          amount,
          type,
        })
      } catch (e) {
        // Skip unparseable rows
      }
    }

    // Fallback: try to parse visible text if no table found
    if (transactions.length === 0) {
      const allText = document.body.innerText
      // Basic text parsing as fallback
      console.log('[iCAN Sync] No table rows found, trying text parsing...')
    }

    return transactions
  }

  function parseBcaDate(text, fallbackYear) {
    // Format: "22/03/2026"
    const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (slashMatch) {
      const [, d, m, y] = slashMatch
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }

    // Format: "22 Mar 2026"
    const months = {
      jan: '01', feb: '02', mar: '03', apr: '04', mei: '05', may: '05',
      jun: '06', jul: '07', agu: '08', aug: '08', sep: '09', okt: '10',
      oct: '10', nov: '11', des: '12', dec: '12',
    }
    const textMatch = text.match(/(\d{1,2})\s+(\w{3})\s*(\d{4})?/)
    if (textMatch) {
      const [, d, m, y] = textMatch
      const month = months[m.toLowerCase()]
      if (month) {
        return `${y || fallbackYear}-${month}-${d.padStart(2, '0')}`
      }
    }

    return null
  }

  function parseBcaAmount(text) {
    // Remove spaces and non-numeric chars except . , - +
    const clean = text.replace(/[^\d.,\-+DB CR]/gi, '')
    const numStr = clean.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '')
    const amount = parseFloat(numStr) || 0

    // Determine type
    const isDebit = /DB|debit|\-/i.test(text)
    const isCredit = /CR|credit|\+/i.test(text)

    return {
      amount,
      type: isCredit ? 'credit' : 'debit',
    }
  }
})()
