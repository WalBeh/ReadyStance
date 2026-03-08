<template>
  <div>
    <header class="app-header">
      <h1>ReadyStance</h1>
      <button class="theme-toggle" @click="toggle" :title="theme === 'dark' ? 'Switch to light' : 'Switch to dark'">
        {{ theme === 'dark' ? '&#9728;' : '&#9790;' }}
      </button>
    </header>
    <router-view />
  </div>
</template>

<script setup>
import { useTheme } from './composables/useTheme.js'
const { theme, toggle } = useTheme()
</script>
