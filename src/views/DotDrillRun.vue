<template>
  <div class="main-content">
    <!-- Start countdown -->
    <CountdownOverlay :visible="phase === 'countdown'" :count="timer.remaining.value" />

    <!-- Dot phase -->
    <template v-if="phase === 'dot'">
      <div class="phase-label">
        {{ currentIsOn ? 'ON' : 'OFF' }} &mdash; {{ timer.remaining.value }}s
      </div>
      <DotBox :x="dotX" :y="dotY" :is-on="currentIsOn" />
      <TimerBar :remaining="timer.remaining.value" :total="config.dotDuration" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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

// Stats tracking
const stats = reactive({
  onTime: 0,
  offTime: 0,
  analysisTime: 0,
  totalCycles: 0,
})

function randomPosition() {
  // Keep dot within 10-90% to avoid edges
  dotX.value = 10 + Math.random() * 80
  dotY.value = 10 + Math.random() * 80
}

async function runDrill() {
  // Ensure audio context is ready (needs user gesture)
  ensureAudioContext()

  // Start countdown
  phase.value = 'countdown'
  await timer.start(config.startTimer)

  // Beep after countdown
  playGymBeep()

  // Wait for beep to finish
  await new Promise((r) => setTimeout(r, 1000))

  // Run cycles
  for (let i = 1; i <= config.cycles; i++) {
    currentCycle.value = i

    // Dot phase
    phase.value = 'dot'
    currentIsOn.value = Math.random() > 0.5
    randomPosition()

    await timer.start(config.dotDuration)

    if (currentIsOn.value) {
      stats.onTime += config.dotDuration
    } else {
      stats.offTime += config.dotDuration
    }
    stats.totalCycles++

    // Analysis phase
    phase.value = 'analysis'
    await timer.start(config.analysisDuration)
    stats.analysisTime += config.analysisDuration

    // Beep when analysis ends
    playGymBeep()

    // Brief pause between beep and next cycle
    await new Promise((r) => setTimeout(r, 1000))
  }

  // Done
  phase.value = 'done'
  await new Promise((r) => setTimeout(r, 500))

  router.push({
    name: 'dot-drill-stats',
    query: {
      cycles: stats.totalCycles,
      onTime: stats.onTime,
      offTime: stats.offTime,
      analysisTime: stats.analysisTime,
    },
  })
}

onMounted(() => {
  runDrill()
})
</script>
