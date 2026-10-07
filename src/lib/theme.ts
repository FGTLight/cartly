import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && systemDark())
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'cartly-theme',
      onRehydrateStorage: () => (state) => applyTheme(state?.theme ?? 'system'),
    },
  ),
)

/** Follow OS changes while the theme is "system". */
export function watchSystemTheme() {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => {
    if (useTheme.getState().theme === 'system') applyTheme('system')
  }
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}
