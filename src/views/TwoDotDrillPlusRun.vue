<template>
  <div class="main-content">
    <!-- Start countdown -->
    <CountdownOverlay :visible="phase === 'countdown'" :count="timer.remaining.value" />

    <!-- Dot phase -->
    <template v-if="phase === 'dot'">
      <div class="phase-label">
        {{ dot1On ? 'ON' : 'OFF' }} / {{ dot2On ? 'ON' : 'OFF' }} &mdash; {{ timer.remaining.value }}s
        <span v-if="speedLevel > 0" class="speed-indicator">&times;{{ speedLevel + 1 }}</span>
        <span v-if="hasSwitched" class="speed-indicator"> SWITCHED</span>
      </div>
      <DotBox :dots="[
        { x: dot1X, y: dot1Y, on: dot1On },
        { x: dot2X, y: dot2Y, on: dot2On },
      ]" />
      <TimerBar :remaining="timer.remaining.value" :total="effectiveDotDuration" />
      <div class="cycle-counter">Cycle {{ currentCycle }} / {{ config.cycles }}</div>
    </template>

    <!-- Analysis phase -->
    <template v-if="phase === 'analysis'">
      <div class="analysis-phase">
        <h2>Analysis</h2>
        <p style="color: var(--text-muted)">Observe and assess</p>
        <div style="font-size: 3rem; font-weight: 700; margin-top: 16px">
          {{ timer.remaining.value }}s
        </div>
        <TimerBar :remaining="timer.remaining.value" :total="config.analysisDuration" />
        <div class="cycle-counter mt-16">Cycle {{ currentCycle }} / {{ config.cycles }}</div>
      </div>
    </template>

    <!-- Done (brief, auto-navigates) -->
    <template v-if="phase === 'done'">
      <div class="analysis-phase">
        <h2>Complete!</h2>
        <p style="color: var(--text-muted)">Loading stats...</p>
      </div>
    </template>

    <!-- Drill controls (visible during dot and analysis phases) -->
    <div v-if="phase === 'dot' || phase === 'analysis'" class="drill-controls">
      <button class="btn-drill btn-speed" @click="increaseSpeed" :disabled="phase !== 'dot' && phase !== 'analysis'">
        &#9889; Speed{{ speedLevel > 0 ? ' ×' + (speedLevel + 1) : '' }}
      </button>
      <button class="btn-drill btn-stop" @click="stopDrill">
        &#9632; Stop
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTimer } from '../composables/useTimer.js'
import { useSound } from '../composables/useSound.js'
import { createPositionTracker } from '../composables/useRandomPosition.js'
import DotBox from '../components/DotBox.vue'
import TimerBar from '../components/TimerBar.vue'
import CountdownOverlay from '../components/CountdownOverlay.vue'

const route = useRoute()
const router = useRouter()
const timer = useTimer()
const { playGymBeep, playCompletionBeep, ensureAudioContext } = useSound()

const config = reactive({
  cycles: parseInt(route.query.cycles) || 10,
  startTimer: parseInt(route.query.startTimer) || 5,
  dotDuration: parseInt(route.query.dotDuration) || 3,
  analysisDuration: parseInt(route.query.analysisDuration) || 5,
})

const phase = ref('countdown')
const currentCycle = ref(0)
const dot1On = ref(true)
const dot2On = ref(true)
const dot1X = ref(30)
const dot1Y = ref(50)
const dot2X = ref(70)
const dot2Y = ref(50)
const aborted = ref(false)
const speedLevel = ref(0)
const hasSwitched = ref(false)

let switchTimeout = null

const effectiveDotDuration = computed(() => {
  const factor = [1, 0.66, 0.33][speedLevel.value] || 1
  return Math.max(1, Math.round(config.dotDuration * factor))
})

const stats = reactive({
  onTime: 0,
  offTime: 0,
  analysisTime: 0,
})

const randomPosition1 = createPositionTracker()
const randomPosition2 = createPositionTracker()

function randomizeDots() {
  const pos1 = randomPosition1()
  dot1X.value = pos1.x
  dot1Y.value = pos1.y

  const pos2 = randomPosition2(pos1.x, pos1.y)
  dot2X.value = pos2.x
  dot2Y.value = pos2.y

  dot1On.value = Math.random() > 0.5
  dot2On.value = Math.random() > 0.5
}

function scheduleDotSwitch(durationMs) {
  hasSwitched.value = false
  clearTimeout(switchTimeout)

  // Switch at a random time between 20% and 80% of the duration
  const minDelay = durationMs * 0.2
  const maxDelay = durationMs * 0.8
  const delay = minDelay + Math.random() * (maxDelay - minDelay)

  switchTimeout = setTimeout(() => {
    if (phase.value !== 'dot' || aborted.value) return

    // Only green (on) dots can switch to red (off) — red stays red
    const dot1IsGreen = dot1On.value
    const dot2IsGreen = dot2On.value

    if (!dot1IsGreen && !dot2IsGreen) return // both already red, nothing to switch

    if (dot1IsGreen && dot2IsGreen) {
      // Both green: randomly switch one or both
      const choice = Math.random()
      if (choice < 0.33) {
        dot1On.value = false
      } else if (choice < 0.66) {
        dot2On.value = false
      } else {
        dot1On.value = false
        dot2On.value = false
      }
    } else if (dot1IsGreen) {
      dot1On.value = false
    } else {
      dot2On.value = false
    }
    hasSwitched.value = true

    // Extend the timer by 2 seconds after a color switch
    timer.remaining.value += 2
  }, delay)
}

function stopDrill() {
  aborted.value = true
  clearTimeout(switchTimeout)
  timer.stop()
}

function increaseSpeed() {
  if (speedLevel.value < 2) {
    speedLevel.value++
  } else {
    speedLevel.value = 0
  }
}

function navigateToStats() {
  router.push({
    name: 'two-dot-drill-plus-stats',
    query: {
      cycles: currentCycle.value,
      totalCycles: config.cycles,
      onTime: stats.onTime,
      offTime: stats.offTime,
      analysisTime: stats.analysisTime,
      stopped: aborted.value ? '1' : '0',
    },
  })
}

async function runDrill() {
  ensureAudioContext()

  phase.value = 'countdown'
  await timer.start(config.startTimer)
  if (aborted.value) { navigateToStats(); return }

  playGymBeep()
  await new Promise((r) => setTimeout(r, 1000))
  if (aborted.value) { navigateToStats(); return }

  for (let i = 1; i <= config.cycles; i++) {
    if (aborted.value) break
    currentCycle.value = i

    // Dot phase
    phase.value = 'dot'
    randomizeDots()

    const dotDur = effectiveDotDuration.value
    const dotStartTime = Date.now()

    // Schedule a color switch during this dot phase
    scheduleDotSwitch(dotDur * 1000)

    await timer.start(dotDur)

    clearTimeout(switchTimeout)

    // Track stats using actual elapsed time (accounts for +2s extension on switch)
    const actualDur = Math.round((Date.now() - dotStartTime) / 1000)
    if (dot1On.value) stats.onTime += actualDur
    else stats.offTime += actualDur
    if (dot2On.value) stats.onTime += actualDur
    else stats.offTime += actualDur

    if (aborted.value) break

    // Analysis phase
    phase.value = 'analysis'
    await timer.start(config.analysisDuration)
    stats.analysisTime += config.analysisDuration

    if (aborted.value) break

    // Use completion sound on last cycle, regular beep otherwise
    if (i === config.cycles) {
      playCompletionBeep()
    } else {
      playGymBeep()
    }
    await new Promise((r) => setTimeout(r, 1000))
    if (aborted.value) break
  }

  phase.value = 'done'
  await new Promise((r) => setTimeout(r, 500))
  navigateToStats()
}

onMounted(() => {
  runDrill()
})

onUnmounted(() => {
  clearTimeout(switchTimeout)
})
</script>
