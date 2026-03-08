import { ref, watchEffect, onMounted, onUnmounted } from 'vue'

const theme = ref('light')
let mediaQuery = null

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t)
}

export function useTheme() {
  function detectTheme() {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    theme.value = mediaQuery.matches ? 'dark' : 'light'
  }

  function handleChange(e) {
    if (!localStorage.getItem('theme-override')) {
      theme.value = e.matches ? 'dark' : 'light'
    }
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme-override', theme.value)
  }

  onMounted(() => {
    const stored = localStorage.getItem('theme-override')
    if (stored) {
      theme.value = stored
    } else {
      detectTheme()
    }
    mediaQuery?.addEventListener('change', handleChange)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', handleChange)
  })

  watchEffect(() => applyTheme(theme.value))

  return { theme, toggle }
}
