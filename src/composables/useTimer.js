import { ref, onUnmounted } from 'vue'

export function useTimer() {
  const remaining = ref(0)
  const isRunning = ref(false)
  let intervalId = null
  let resolvePromise = null

  function start(seconds) {
    return new Promise((resolve) => {
      stop()
      remaining.value = seconds
      isRunning.value = true
      resolvePromise = resolve

      intervalId = setInterval(() => {
        remaining.value--
        if (remaining.value <= 0) {
          stop()
          resolve()
        }
      }, 1000)
    })
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
    if (resolvePromise) {
      resolvePromise()
      resolvePromise = null
    }
  }

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return { remaining, isRunning, start, stop }
}
