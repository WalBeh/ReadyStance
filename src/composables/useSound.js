let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

function playBeep(frequency, duration, startTime) {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.value = frequency
  oscillator.type = 'square'
  gainNode.gain.value = 0.3

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export function useSound() {
  async function playGymBeep() {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') await ctx.resume()
    const now = ctx.currentTime

    // 3 short beeps + 1 long beep: pi-pi-pi-piiiip
    playBeep(880, 0.1, now)
    playBeep(880, 0.1, now + 0.2)
    playBeep(880, 0.1, now + 0.4)
    playBeep(1100, 0.4, now + 0.6)
  }

  function ensureAudioContext() {
    getAudioContext()
  }

  return { playGymBeep, ensureAudioContext }
}
