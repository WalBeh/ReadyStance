import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './views/HomePage.vue'
import DotDrillSetup from './views/DotDrillSetup.vue'
import DotDrillRun from './views/DotDrillRun.vue'
import DotDrillStats from './views/DotDrillStats.vue'
import TwoDotDrillRun from './views/TwoDotDrillRun.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/dot-drill', component: DotDrillSetup, meta: { title: 'Dot Drill', runRoute: 'dot-drill-run' } },
  { path: '/dot-drill/run', name: 'dot-drill-run', component: DotDrillRun },
  { path: '/dot-drill/stats', name: 'dot-drill-stats', component: DotDrillStats, meta: { setupPath: '/dot-drill' } },
  { path: '/two-dot-drill', component: DotDrillSetup, meta: { title: '2 Dot Drill', runRoute: 'two-dot-drill-run' } },
  { path: '/two-dot-drill/run', name: 'two-dot-drill-run', component: TwoDotDrillRun },
  { path: '/two-dot-drill/stats', name: 'two-dot-drill-stats', component: DotDrillStats, meta: { setupPath: '/two-dot-drill' } },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
