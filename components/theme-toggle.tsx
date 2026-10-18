'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const buttonClass =
    'flex size-9 items-center justify-center rounded-full border-2 border-emerald-400 bg-transparent text-emerald-400 transition-colors hover:border-emerald-300 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:size-4'

  if (!mounted) {
    return (
      <button
        type="button"
        className={buttonClass}
        aria-label="Theme"
      >
        <Sun className="size-4" />
      </button>
    )
  }

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={toggle}
      aria-label={
        resolvedTheme === 'dark'
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      }
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  )
}
