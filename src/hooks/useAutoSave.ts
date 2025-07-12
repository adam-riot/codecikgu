'use client'

import { useEffect, useRef, useState } from 'react'
import { useSuccessNotification, useErrorNotification } from '../components/NotificationProvider'

interface UseAutoSaveOptions {
  data: any
  saveAction: (data: any) => Promise<void>
  delay?: number
  enabled?: boolean
}

export const useAutoSave = ({ 
  data, 
  saveAction, 
  delay = 3000, 
  enabled = true 
}: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string | null>(null)
  const showSuccess = useSuccessNotification()
  const showError = useErrorNotification()

  useEffect(() => {
    if (!enabled) return

    const currentData = JSON.stringify(data)
    
    // Don't save if data hasn't changed
    if (currentData === lastSavedRef.current) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveAction(data)
        lastSavedRef.current = currentData
        showSuccess('Auto-simpan', 'Kod anda telah disimpan secara automatik')
      } catch (error) {
        showError('Ralat Auto-simpan', 'Gagal menyimpan kod secara automatik')
      }
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, saveAction, delay, enabled, showSuccess, showError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
}

// Keyboard shortcuts hook
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const ctrl = event.ctrlKey || event.metaKey
      const shift = event.shiftKey
      const alt = event.altKey

      let shortcutKey = ''
      if (ctrl) shortcutKey += 'ctrl+'
      if (shift) shortcutKey += 'shift+'
      if (alt) shortcutKey += 'alt+'
      shortcutKey += key

      if (shortcuts[shortcutKey]) {
        event.preventDefault()
        shortcuts[shortcutKey]()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Local storage hook for persistence
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}
