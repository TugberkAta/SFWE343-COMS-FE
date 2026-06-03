import { useEffect, useState } from 'react'

export function useTheme() {
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark'
  )

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark)
    }
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', dark ? 'dark' : 'light')
      }
    } catch (e) {
      // ignore
    }
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}
