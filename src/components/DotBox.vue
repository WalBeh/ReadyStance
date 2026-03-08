<template>
  <div class="dot-box" ref="boxRef">
    <div
      class="dot"
      :class="isOn ? 'on' : 'off'"
      :style="{ left: x + '%', top: y + '%' }"
    />
  </div>
</template>

<script setup>
defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  isOn: { type: Boolean, required: true },
})
</script>
