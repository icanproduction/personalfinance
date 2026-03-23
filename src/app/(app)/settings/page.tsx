'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Chrome, RefreshCw, Smartphone, Info } from 'lucide-react'

export default function SettingsPage() {
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if push is enabled
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setPushEnabled(!!sub)
        })
      })
    }

    // Check if installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const togglePush = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Browser tidak mendukung notifikasi')
      return
    }

    setPushLoading(true)

    try {
      const reg = await navigator.serviceWorker.ready

      if (pushEnabled) {
        // Unsubscribe
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await fetch('/api/push-subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          })
          await sub.unsubscribe()
        }
        setPushEnabled(false)
      } else {
        // Subscribe
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          alert('Izinkan notifikasi di pengaturan browser')
          setPushLoading(false)
          return
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        })

        const subJson = sub.toJSON()
        await fetch('/api/push-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: subJson.keys,
            device_label: navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Android',
          }),
        })
        setPushEnabled(true)
      }
    } catch (err) {
      console.error('Push error:', err)
    }

    setPushLoading(false)
  }

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const result = await installPrompt.userChoice
      if (result.outcome === 'accepted') {
        setIsInstalled(true)
      }
      setInstallPrompt(null)
    }
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-lg font-semibold text-white mb-6">Pengaturan</h1>

      {/* Install PWA */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-indigo-400" />
            <div>
              <p className="text-sm font-medium text-white">Install App</p>
              <p className="text-xs text-slate-400">
                {isInstalled ? 'Sudah terinstall' : 'Pasang di home screen'}
              </p>
            </div>
          </div>
          {!isInstalled && installPrompt && (
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 bg-indigo-600 text-white text-xs rounded-lg active:bg-indigo-700"
            >
              Install
            </button>
          )}
          {isInstalled && (
            <span className="text-xs text-emerald-400">Aktif</span>
          )}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {pushEnabled ? (
              <Bell size={20} className="text-indigo-400" />
            ) : (
              <BellOff size={20} className="text-slate-400" />
            )}
            <div>
              <p className="text-sm font-medium text-white">Notifikasi Harian</p>
              <p className="text-xs text-slate-400">
                Ringkasan pengeluaran jam 9 malam
              </p>
            </div>
          </div>
          <button
            onClick={togglePush}
            disabled={pushLoading}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              pushEnabled ? 'bg-indigo-600' : 'bg-slate-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                pushEnabled ? 'left-6' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Chrome Extension */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-3">
        <div className="flex items-center gap-3">
          <Chrome size={20} className="text-slate-400" />
          <div>
            <p className="text-sm font-medium text-white">BCA Auto-Sync</p>
            <p className="text-xs text-slate-400">
              Chrome Extension untuk sync otomatis dari myBCA
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 ml-8">
          Download extension dari folder <code className="text-indigo-400">extensions/myBCA-sync</code> dan load di Chrome.
        </p>
      </div>

      {/* Sync Status */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-3">
        <div className="flex items-center gap-3">
          <RefreshCw size={20} className="text-slate-400" />
          <div>
            <p className="text-sm font-medium text-white">Status Sync</p>
            <p className="text-xs text-slate-400">
              Cek riwayat sinkronisasi BCA
            </p>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-3">
        <div className="flex items-center gap-3">
          <Info size={20} className="text-slate-400" />
          <div>
            <p className="text-sm font-medium text-white">iCAN Financial</p>
            <p className="text-xs text-slate-400">v1.0.0 · By iCAN Production</p>
          </div>
        </div>
      </div>
    </div>
  )
}
