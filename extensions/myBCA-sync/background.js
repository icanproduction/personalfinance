// ============================================
// iCAN Financial - Background Service Worker
// ============================================
// Handles daily auto-sync alarm

const ALARM_NAME = 'daily-bca-sync'

// Set up daily alarm (every 24 hours)
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: 1440, // 24 hours
    delayInMinutes: 1,
  })
  console.log('[iCAN Sync] Daily alarm set')
})

// Alarm handler - try to sync if myBCA tab is open
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return

  const tabs = await chrome.tabs.query({ url: 'https://mybca.bca.co.id/*' })
  if (tabs.length > 0) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrapeTransactions' }, (response) => {
      if (response?.success) {
        console.log(`[iCAN Sync] Auto-sync: ${response.new} new transactions`)
      }
    })
  }
})
