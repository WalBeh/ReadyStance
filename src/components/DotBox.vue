<template>
  <div class="dot-box">
    <div
      v-for="(dot, i) in resolvedDots"
      :key="i"
      class="dot"
      :class="dot.on ? 'on' : 'off'"
      :style="{ left: dot.x + '%', top: dot.y + '%' }"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  dots: { type: Array, default: null },
  x: { type: Number, default: 50 },
  y: { type: Number, default: 50 },
  isOn: { type: Boolean, default: true },
})

const resolvedDots = computed(() => {
  if (props.dots) return props.dots
  return [{ x: props.x, y: props.y, on: props.isOn }]
})
</script>
