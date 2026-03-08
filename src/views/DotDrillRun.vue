<template>
  <div class="main-content">
    <!-- Start countdown -->
    <CountdownOverlay :visible="phase === 'countdown'" :count="timer.remaining.value" />

    <!-- Dot phase -->
    <template v-if="phase === 'dot'">
      <div class="phase-label">
        {{ currentIsOn ? 'ON' : 'OFF' }} &mdash; {{ timer.remaining.value }}s
        <span v-if="speedLevel > 0" class="speed-indicator">&times;{{ speedLevel + 1 }}</span>
      </div>
      <DotBox :x="dotX" :y="dotY" :is-on="currentIsOn" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTimer } from '../composables/useTimer.js'
import { useSound } from '../composables/useSound.js'
import DotBox from '../components/DotBox.vue'
import TimerBar from '../components/TimerBar.vue'
import CountdownOverlay from '../components/CountdownOverlay.vue'

const route = useRoute()
const router = useRouter()
const timer = useTimer()
const { playGymBeep, ensureAudioContext } = useSound()

const config = reactive({
  cycles: parseInt(route.query.cycles) || 10,
  startTimer: parseInt(route.query.startTimer) || 5,
  dotDuration: parseInt(route.query.dotDuration) || 3,
  analysisDuration: parseInt(route.query.analysisDuration) || 5,
})

const phase = ref('countdown') // countdown | dot | analysis | done
const currentCycle = ref(0)
const currentIsOn = ref(true)
const dotX = ref(50)
const dotY = ref(50)
const aborted = ref(false)
const speedLevel = ref(0) // 0 = normal, 1 = fast, 2 = fastest

// Speed reduces dot duration: 0 → full, 1 → 66%, 2 → 33% (min 1s)
const effectiveDotDuration = computed(() => {
  const factor = [1, 0.66, 0.33][speedLevel.value] || 1
  return Math.max(1, Math.round(config.dotDuration * factor))
})

// Stats tracking
const stats = reactive({
  onTime: 0,
  offTime: 0,
  analysisTime: 0,
})

// Track recent positions to avoid clustering
const recentPositions = []
const MIN_DISTANCE = 25 // minimum % distance between consecutive dots

function randomPosition() {
  let bestX, bestY, bestDist = -1

  // Try several candidates and pick the one farthest from recent positions
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidateX = 10 + Math.random() * 80
    const candidateY = 10 + Math.random() * 80

    // Calculate minimum distance to all recent positions
    let minDist = Infinity
    for (const pos of recentPositions) {
      const dx = candidateX - pos.x
      const dy = candidateY - pos.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      minDist = Math.min(minDist, dist)
    }

    // If no recent positions or this is far enough, use it immediately
    if (recentPositions.length === 0 || minDist >= MIN_DISTANCE) {
      bestX = candidateX
      bestY = candidateY
      break
    }

    // Otherwise track the best candidate so far
    if (minDist > bestDist) {
      bestDist = minDist
      bestX = candidateX
      bestY = candidateY
    }
  }

  dotX.value = bestX
  dotY.value = bestY

  // Remember last 3 positions
  recentPositions.push({ x: bestX, y: bestY })
  if (recentPositions.length > 3) {
    recentPositions.shift()
  }
}

function stopDrill() {
  aborted.value = true
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
    name: 'dot-drill-stats',
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
  // Ensure audio context is ready (needs user gesture)
  ensureAudioContext()

  // Start countdown
  phase.value = 'countdown'
  await timer.start(config.startTimer)
  if (aborted.value) { navigateToStats(); return }

  // Beep after countdown
  playGymBeep()

  // Wait for beep to finish
  await new Promise((r) => setTimeout(r, 1000))
  if (aborted.value) { navigateToStats(); return }

  // Run cycles
  for (let i = 1; i <= config.cycles; i++) {
    if (aborted.value) break
    currentCycle.value = i

    // Dot phase
    phase.value = 'dot'
    currentIsOn.value = Math.random() > 0.5
    randomPosition()

    const dotDur = effectiveDotDuration.value
    await timer.start(dotDur)

    if (currentIsOn.value) {
      stats.onTime += dotDur
    } else {
      stats.offTime += dotDur
    }

    if (aborted.value) break

    // Analysis phase
    phase.value = 'analysis'
    await timer.start(config.analysisDuration)
    stats.analysisTime += config.analysisDuration

    if (aborted.value) break

    // Beep when analysis ends
    playGymBeep()

    // Brief pause between beep and next cycle
    await new Promise((r) => setTimeout(r, 1000))
    if (aborted.value) break
  }

  // Done
  phase.value = 'done'
  await new Promise((r) => setTimeout(r, 500))
  navigateToStats()
}

onMounted(() => {
  runDrill()
})
</script>
