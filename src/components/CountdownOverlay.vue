<template>
  <div class="countdown-overlay" v-if="visible">
    <div class="countdown-number">{{ count }}</div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  count: { type: Number, required: true },
})
</script>
