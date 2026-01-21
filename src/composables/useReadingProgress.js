import { ref, onMounted, onUnmounted } from 'vue'

export function useReadingProgress() {
  const progress = ref(0)
  const timeRemaining = ref(0)
  const isReading = ref(false)

  let startTime = null
  let totalWords = 0

  const updateProgress = () => {
    if (typeof window === 'undefined') return
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    
    if (docHeight <= 0) return
    
    const scrollPercent = (scrollTop / docHeight) * 100
    progress.value = Math.min(100, Math.max(0, scrollPercent))

    if (progress.value > 10 && !isReading.value) {
      isReading.value = true
      startTime = Date.now()
    }

    if (isReading.value && progress.value > 0 && startTime) {
      const elapsed = (Date.now() - startTime) / 1000 / 60
      const wordsPerMinute = 225
      const estimatedTotal = totalWords / wordsPerMinute
      const remaining = estimatedTotal - elapsed
      timeRemaining.value = Math.max(0, remaining)
    }
  }

  const initializeReading = (wordCount) => {
    totalWords = wordCount || 1000
    timeRemaining.value = totalWords / 225
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', updateProgress, { passive: true })
      updateProgress()
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', updateProgress)
    }
  })

  return { progress, timeRemaining, initializeReading }
}