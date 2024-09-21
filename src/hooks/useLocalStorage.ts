import { useCallback, useRef, useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // ローカルステートを使用して、コンポーネントの再レンダリングをトリガー
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    const storedValue = window.localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : initialValue
  })

  // 最新の値を追跡するためのrefを使用
  const latestValue = useRef(state)

  useEffect(() => {
    latestValue.current = state
    window.localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  const setValue = useCallback((newValue: T | ((prevValue: T) => T)) => {
    const valueToStore =
      newValue instanceof Function ? newValue(latestValue.current) : newValue
    setState(valueToStore)
    // ローカルストレージの更新はuseEffectで行うため、ここでは不要
  }, [])

  // storageイベントのリスナーを追加
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        setState(JSON.parse(event.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key])

  return [state, setValue] as const
}
