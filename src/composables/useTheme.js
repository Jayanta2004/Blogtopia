import { ref, watch } from 'vue'

const theme = ref('light')
const fontSize = ref('medium')

// Initialize from localStorage safely
if (typeof window !== 'undefined') {
  try {
    theme.value = localStorage.getItem('blogtopia-theme') || 'light'
    fontSize.value = localStorage.getItem('blogtopia-font-size') || 'medium'
  } catch (e) {
    console.warn('localStorage not available')
  }
}

export function useTheme() {
  const setTheme = (newTheme) => {
    theme.value = newTheme
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
    try {
      localStorage.setItem('blogtopia-theme', newTheme)
    } catch (e) {
      console.warn('Could not save theme to localStorage')
    }
  }

  const setFontSize = (size) => {
    fontSize.value = size
    const sizes = { small: '0.9', medium: '1', large: '1.1', xlarge: '1.2' }
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = `${sizes[size]}rem`
    }
    try {
      localStorage.setItem('blogtopia-font-size', size)
    } catch (e) {
      console.warn('Could not save font size to localStorage')
    }
  }

  // Watch for theme changes and apply immediately
  watch(theme, (newTheme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }, { immediate: true })

  // Initialize on first load
  if (typeof window !== 'undefined') {
    setTheme(theme.value)
    setFontSize(fontSize.value)
  }

  return { theme, fontSize, setTheme, setFontSize }
}