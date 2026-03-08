<template>
  <div class="main-content">
    <h2 style="margin-bottom: 16px">Dot Drill Setup</h2>

    <div class="card">
      <div class="form-group">
        <label>Number of Cycles</label>
        <div class="slider-row">
          <input type="range" v-model.number="config.cycles" min="1" max="50" class="slider" />
          <span class="slider-value">{{ config.cycles }}</span>
        </div>
      </div>

      <div class="form-group">
        <label>Start Countdown (seconds)</label>
        <div class="slider-row">
          <input type="range" v-model.number="config.startTimer" min="1" max="15" class="slider" />
          <span class="slider-value">{{ config.startTimer }}s</span>
        </div>
      </div>

      <div class="form-group">
        <label>ON/OFF Duration (seconds)</label>
        <div class="slider-row">
          <input type="range" v-model.number="config.dotDuration" min="1" max="15" class="slider" />
          <span class="slider-value">{{ config.dotDuration }}s</span>
        </div>
      </div>

      <div class="form-group">
        <label>Analysis Duration (seconds)</label>
        <div class="slider-row">
          <input type="range" v-model.number="config.analysisDuration" min="1" max="30" class="slider" />
          <span class="slider-value">{{ config.analysisDuration }}s</span>
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
