// ============================================
// iCAN Financial - Popup Script
// ============================================

const syncBtn = document.getElementById('syncBtn')
const statusBox = document.getElementById('statusBox')
const resultDiv = document.getElementById('result')
const apiUrlInput = document.getElementById('apiUrl')

const API_URL_KEY = 'ican_api_url'
const DEFAULT_API_URL = 'https://ican-financial.vercel.app'

// Load saved API URL
chrome.storage.sync.get(API_URL_KEY, (data) => {
  apiUrlInput.value = data[API_URL_KEY] || DEFAULT_API_URL
})

// Save API URL on change
apiUrlInput.addEventListener('change', () => {
  chrome.storage.sync.set({ [API_URL_KEY]: apiUrlInput.value })
})

// Check if we're on myBCA
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0]
  if (tab && tab.url && tab.url.includes('mybca.bca.co.id')) {
    syncBtn.disabled = false
    statusBox.className = 'status info'
    statusBox.textContent = 'Siap sync dari halaman myBCA'
  } else {
    statusBox.textContent = 'Buka mybca.bca.co.id/activity dulu'
  }
})

// Sync button click
syncBtn.addEventListener('click', async () => {
  syncBtn.disabled = true
  syncBtn.textContent = 'Syncing...'
  statusBox.className = 'status info'
  statusBox.textContent = 'Sedang mengambil data transaksi...'
  resultDiv.style.display = 'none'

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    chrome.tabs.sendMessage(tab.id, { action: 'scrapeTransactions' }, (response) => {
      if (chrome.runtime.lastError) {
        showError('Tidak bisa connect ke halaman. Refresh halaman myBCA dan coba lagi.')
        return
      }

      if (!response) {
        showError('Tidak ada response dari halaman.')
        return
      }

      if (response.success) {
        statusBox.className = 'status success'
        statusBox.textContent = 'Sync berhasil!'
        resultDiv.style.display = 'block'
        resultDiv.innerHTML = `
          Ditemukan: <span>${response.found}</span> transaksi<br>
          Baru: <span>${response.new}</span><br>
          Duplikat: <span>${response.duplicate}</span>
        `
      } else {
        showError(response.error || 'Gagal sync')
      }

      syncBtn.disabled = false
      syncBtn.textContent = 'Sync Sekarang'
    })
  } catch (err) {
    showError(err.message)
  }
})

function showError(msg) {
  statusBox.className = 'status error'
  statusBox.textContent = msg
  syncBtn.disabled = false
  syncBtn.textContent = 'Sync Sekarang'
}
