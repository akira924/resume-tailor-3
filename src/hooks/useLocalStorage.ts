import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch { /* quota exceeded or unavailable */ }
  }, [key, value])

  const reset = useCallback(() => {
    setValue(initialValue)
    localStorage.removeItem(key)
  }, [key, initialValue])

  return [value, setValue, reset] as const
}
