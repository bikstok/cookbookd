<script setup lang="ts">
</script>

<template>
  <router-view />
</template>

<style>
/* Any global transitions or styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
