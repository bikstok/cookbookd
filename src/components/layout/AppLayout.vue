<script setup lang="ts">
import Navbar from './Navbar.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans selection:bg-orange-200 flex flex-col">
    <Navbar />

    <!-- Page Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="mt-auto py-12 border-t border-border bg-muted/30">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-sm text-muted-foreground">© CookBook'd - Jakob Kjærulff</p>
      </div>
    </footer>
  </div>
</template>
