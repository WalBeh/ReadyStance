<template>
  <div class="main-content">
    <h2 class="text-center" style="margin-bottom: 24px">
      {{ stopped ? 'Drill Stopped' : 'Session Complete' }}
    </h2>

    <div class="stat-grid">
      <div class="stat-item">
        <div class="value">{{ cycles }}<span v-if="stopped" class="stat-total"> / {{ totalCycles }}</span></div>
        <div class="label">Cycles</div>
      </div>
      <div class="stat-item">
        <div class="value">{{ onTime }}s</div>
        <div class="label">ON Time</div>
      </div>
      <div class="stat-item">
        <div class="value">{{ offTime }}s</div>
        <div class="label">OFF Time</div>
      </div>
      <div class="stat-item">
        <div class="value">{{ analysisTime }}s</div>
        <div class="label">Analysis</div>
      </div>
    </div>

    <div class="mt-24 flex-col gap-12">
      <button class="btn btn-primary" @click="restart">Run Again</button>
      <button class="btn btn-secondary mt-16" @click="$router.push('/')">Home</button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const cycles = Number(route.query.cycles) || 0
const totalCycles = Number(route.query.totalCycles) || cycles
const onTime = Number(route.query.onTime) || 0
const offTime = Number(route.query.offTime) || 0
const analysisTime = Number(route.query.analysisTime) || 0
const stopped = route.query.stopped === '1'

function restart() {
  router.push(route.meta.setupPath)
}
</script>
