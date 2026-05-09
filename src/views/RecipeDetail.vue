<script setup lang="ts">
import AppLayout from '../components/layout/AppLayout.vue'
import RecipeDetailContent from '../components/recipes/RecipeDetailContent.vue'
import { useRecipeDetail } from '@/composables/useRecipeDetail'
import { Button } from '@/components/ui/button'
import { Utensils } from 'lucide-vue-next'

const props = defineProps<{
  id: string
}>()

const { recipe, isLoading, error } = useRecipeDetail(props.id)
</script>

<template>
  <AppLayout>
    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div class="aspect-[21/9] bg-muted/50 rounded-2xl"></div>
      <div class="space-y-4">
        <div class="h-10 w-2/3 bg-muted/50 rounded-lg"></div>
        <div class="flex gap-4">
          <div class="h-6 w-24 bg-muted/50 rounded-full"></div>
          <div class="h-6 w-24 bg-muted/50 rounded-full"></div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div class="col-span-1 h-96 bg-muted/50 rounded-xl"></div>
        <div class="col-span-2 h-96 bg-muted/50 rounded-xl"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-2xl mx-auto text-center py-20">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-4">
        <Utensils class="h-8 w-8" />
      </div>
      <h2 class="text-2xl font-bold text-foreground mb-2">Recipe Not Found</h2>
      <p class="text-muted-foreground">{{ error }}</p>
      <Button variant="outline" class="mt-6" @click="$router.push('/')">Return to Dashboard</Button>
    </div>

    <!-- Recipe Content -->
    <RecipeDetailContent v-else-if="recipe" :recipe="recipe" />
  </AppLayout>
</template>
