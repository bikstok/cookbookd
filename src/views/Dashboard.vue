<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import RecipeCard from '../components/recipes/RecipeCard.vue'
import { useRecipeSearch } from '@/composables/useRecipeSearch'
import { useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-vue-next'

const router = useRouter()
const { searchQuery, isLoading, error, filteredRecipes, fetchRecipes } = useRecipeSearch()

const openRecipe = (id: string) => {
  router.push(`/recipe/${id}`)
}

onMounted(() => {
  fetchRecipes()
})
</script>

<template>
  <AppLayout>
    <div class="space-y-8">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="max-w-2xl">
          <h1 class="text-4xl font-extrabold text-foreground tracking-tight mb-2">Our Recipes</h1>
          <p class="text-muted-foreground text-lg italic">The shared culinary journal of Julie & Casper.</p>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-80 group">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            v-model="searchQuery"
            placeholder="Search recipes, ingredients, tags..." 
            class="pl-10 bg-white border-border focus:ring-primary/20 transition-all rounded-full shadow-sm"
          />
        </div>
      </header>
      
      <!-- Error State -->
      <div v-if="error" class="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-center">
        <p class="font-bold">Failed to load recipes</p>
        <p class="text-sm">{{ error }}</p>
        <button @click="fetchRecipes" class="mt-2 underline text-sm">Try again</button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 6" :key="i" class="h-72 bg-muted/50 border border-border rounded-xl animate-pulse"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRecipes.length === 0" class="py-20 text-center space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
          <Search class="h-8 w-8" />
        </div>
        <h3 class="text-xl font-bold text-foreground">No recipes found</h3>
        <p class="text-muted-foreground">Try searching for something else or add a new recipe.</p>
      </div>

      <!-- Recipe Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <RecipeCard 
          v-for="recipe in filteredRecipes" 
          :key="recipe.id" 
          :recipe="recipe"
          @click="openRecipe(recipe.id)"
        />
      </div>
    </div>
  </AppLayout>
</template>
