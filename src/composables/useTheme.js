import { ref, watchEffect, onMounted, onUnmounted } from 'vue'

const theme = ref('light')
let initialized = false
let mediaQuery = null
let hasOverride = false

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t)
}

export function useTheme() {
  function handleChange(e) {
    if (!hasOverride) {
      theme.value = e.matches ? 'dark' : 'light'
    }
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    hasOverride = true
    localStorage.setItem('theme-override', theme.value)
  }

  onMounted(() => {
    if (initialized) return
    initialized = true

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const stored = localStorage.getItem('theme-override')
    if (stored) {
      hasOverride = true
      theme.value = stored
    } else {
      theme.value = mediaQuery.matches ? 'dark' : 'light'
    }
    mediaQuery.addEventListener('change', handleChange)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', handleChange)
    initialized = false
  })

  watchEffect(() => applyTheme(theme.value))

  return { theme, toggle }
}
