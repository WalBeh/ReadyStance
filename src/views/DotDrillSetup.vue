<template>
  <div class="main-content">
    <h2 style="margin-bottom: 16px">Dot Drill Setup</h2>

    <div class="card">
      <div v-for="field in fields" :key="field.key" class="form-group">
        <label>{{ field.label }}</label>
        <div class="slider-row">
          <input
            type="range"
            v-model.number="config[field.key]"
            :min="field.min"
            :max="field.max"
            class="slider"
          />
          <span class="slider-value">{{ config[field.key] }}{{ field.suffix }}</span>
        </div>
      </div>
    </div>

    <button class="btn btn-primary" @click="startDrill">Start Drill</button>
    <button class="btn btn-secondary mt-16" @click="$router.push('/')">Back</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const fields = [
  { key: 'cycles', label: 'Number of Cycles', min: 1, max: 50, suffix: '' },
  { key: 'startTimer', label: 'Start Countdown (seconds)', min: 1, max: 15, suffix: 's' },
  { key: 'dotDuration', label: 'ON/OFF Duration (seconds)', min: 1, max: 15, suffix: 's' },
  { key: 'analysisDuration', label: 'Analysis Duration (seconds)', min: 1, max: 30, suffix: 's' },
]

const config = reactive({
  cycles: 10,
  startTimer: 5,
  dotDuration: 3,
  analysisDuration: 5,
})

function startDrill() {
  router.push({
    name: 'dot-drill-run',
    query: {
      cycles: config.cycles,
      startTimer: config.startTimer,
      dotDuration: config.dotDuration,
      analysisDuration: config.analysisDuration,
    },
  })
}
</script>
