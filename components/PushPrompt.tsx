'use client'
import { useEffect } from 'react'

export function PushPrompt({ godchildId }: { godchildId: string | number }) {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'granted') return

    // Prompt once, stored in localStorage
    const prompted = localStorage.getItem('push-prompted')
    if (prompted) return

    const timer = setTimeout(async () => {
      localStorage.setItem('push-prompted', '1')
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ godchildId, subscription }),
      })
    }, 5000)

    return () => clearTimeout(timer)
  }, [godchildId])

  return null
}
