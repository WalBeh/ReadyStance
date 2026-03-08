import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './views/HomePage.vue'
import DotDrillSetup from './views/DotDrillSetup.vue'
import DotDrillRun from './views/DotDrillRun.vue'
import DotDrillStats from './views/DotDrillStats.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/dot-drill', component: DotDrillSetup },
  { path: '/dot-drill/run', name: 'dot-drill-run', component: DotDrillRun },
  { path: '/dot-drill/stats', name: 'dot-drill-stats', component: DotDrillStats },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
