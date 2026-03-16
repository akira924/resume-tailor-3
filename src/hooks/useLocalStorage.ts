import { useState, useEffect, useCallback, useRef } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  const isResetting = useRef(false)

  useEffect(() => {
    if (isResetting.current) {
      isResetting.current = false
      return
    }
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch { /* quota exceeded or unavailable */ }
  }, [key, value])

  const reset = useCallback(() => {
    isResetting.current = true
    setValue(initialValue)
    try {
      localStorage.removeItem(key)
    } catch { /* storage unavailable */ }
  }, [key, initialValue])

  return [value, setValue, reset] as const
}
