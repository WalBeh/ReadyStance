<template>
  <div class="timer-bar">
    <div class="timer-bar-fill" :style="{ width: percentage + '%' }" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  remaining: { type: Number, required: true },
  total: { type: Number, required: true },
})

const percentage = computed(() => {
  if (props.total <= 0) return 0
  return (props.remaining / props.total) * 100
})
</script>
