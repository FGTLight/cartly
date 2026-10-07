import { Monitor, Moon, Sun } from 'lucide-react'

import { type Theme, useTheme } from '@/lib/theme'

const next: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }
const icons = { light: Sun, dark: Moon, system: Monitor }
const labels = { light: 'Light theme', dark: 'Dark theme', system: 'System theme' }

/** Cycles light → dark → system. */
export function ThemeToggle() {
  const theme = useTheme((s) => s.theme)
  const setTheme = useTheme((s) => s.setTheme)
  const Icon = icons[theme]
  return (
    <button
      type="button"
      onClick={() => setTheme(next[theme])}
      className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      aria-label={`${labels[theme]}. Switch to ${labels[next[theme]].toLowerCase()}`}
      title={labels[theme]}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  )
}
