<template>
  <div class="main-content">
    <h2 style="margin-bottom: 16px">Select Playbook</h2>
    <div class="playbook-grid">
      <div class="playbook-card" @click="$router.push('/dot-drill')">
        <div class="icon">&#11044;</div>
        <h3>Dot Drill</h3>
        <p>Track the dot as it appears at random positions</p>
      </div>
      <div class="playbook-card" @click="$router.push('/two-dot-drill')">
        <div class="icon">&#11044;&#11044;</div>
        <h3>2 Dot Drill</h3>
        <p>Track two dots with random color combinations</p>
      </div>
      <div class="playbook-card" @click="$router.push('/two-dot-drill-plus')">
        <div class="icon">&#11044;&#8644;&#11044;</div>
        <h3>2 Dot Drill+</h3>
        <p>Dots switch colors mid-round to test reaction</p>
      </div>
    </div>
  </div>
</template>
