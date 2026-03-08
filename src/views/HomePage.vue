<template>
  <div class="main-content">
    <h2 style="margin-bottom: 16px">Select Playbook</h2>
    <div class="playbook-grid">
      <div class="playbook-card" @click="$router.push('/dot-drill')">
        <div class="icon">&#11044;</div>
        <h3>Dot Drill</h3>
        <p>Track the dot as it appears at random positions</p>
      </div>
      <div class="playbook-card" style="opacity: 0.4; pointer-events: none">
        <div class="icon">&#10010;</div>
        <h3>Coming Soon</h3>
        <p>More playbooks in development</p>
      </div>
    </div>
  </div>
</template>
