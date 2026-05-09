<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RecipeSummary } from '@/types/database'

defineProps<{
  recipe: RecipeSummary
}>()

defineEmits<{
  (e: 'click', id: string): void
}>()
</script>

<template>
  <Card 
    class="overflow-hidden border-border bg-card hover:shadow-md transition-shadow cursor-pointer group"
    @click="$emit('click', recipe.id)"
  >
    <div class="aspect-video relative overflow-hidden bg-muted">
      <img 
        v-if="recipe.image_url" 
        :src="recipe.image_url" 
        :alt="recipe.title"
        class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground/40">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <!-- Favorite Badge (Placeholder for logic) -->
      <div class="absolute top-2 right-2">
        <div class="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      </div>
    </div>

    <CardHeader class="p-4 pb-2">
      <div class="flex gap-1 mb-2">
        <span 
          v-for="tag in recipe.tags.slice(0, 2)" 
          :key="tag"
          class="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider rounded-md"
        >
          {{ tag }}
        </span>
      </div>
      <CardTitle class="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
        {{ recipe.title }}
      </CardTitle>
    </CardHeader>
    
    <CardContent class="p-4 pt-0">
      <p class="text-sm text-muted-foreground line-clamp-2 mb-4">
        {{ recipe.description || 'No description provided.' }}
      </p>
      
      <div class="flex items-center justify-between text-xs font-medium text-muted-foreground/80 border-t border-orange-50 pt-3">
        <div class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
          {{ recipe.created_by_name }}
        </div>
      </div>
    </CardContent>
  </Card>
</template>
