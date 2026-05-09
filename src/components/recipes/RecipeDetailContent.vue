<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FullRecipe } from '@/composables/useRecipeDetail'
import { Clock, ChefHat, Minus, Plus, Utensils } from 'lucide-vue-next'

const props = defineProps<{
  recipe: FullRecipe
}>()

// Serving Scaler Logic
const targetServings = ref(1)

watch(() => props.recipe, (newRecipe) => {
  if (newRecipe) {
    targetServings.value = newRecipe.servings || 1
  }
}, { immediate: true })

const incrementServings = () => targetServings.value++
const decrementServings = () => {
  if (targetServings.value > 1) targetServings.value--
}

const scaleAmount = (amount: number | null, baseServings: number) => {
  if (!amount || !baseServings) return null
  const scaled = (amount / baseServings) * targetServings.value
  // Format to 2 decimal places to avoid crazy floating point numbers
  return Number.isInteger(scaled) ? scaled : Number(scaled.toFixed(2))
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-10">
    
    <!-- Hero Section -->
    <header class="space-y-6">
      <!-- Hero Image -->
      <div class="aspect-[21/9] bg-muted rounded-2xl overflow-hidden shadow-sm relative group">
        <img 
          v-if="recipe.image_url" 
          :src="recipe.image_url" 
          :alt="recipe.title"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 bg-secondary">
          <Utensils class="h-20 w-20 mb-4" />
          <span class="font-medium tracking-wide">NO IMAGE PROVIDED</span>
        </div>
        <!-- Tags Overlay -->
        <div class="absolute bottom-4 left-4 flex gap-2">
          <span 
            v-for="tag in recipe.tags" 
            :key="tag.id"
            class="px-3 py-1 bg-white/90 backdrop-blur text-primary text-xs font-bold uppercase tracking-wider rounded-md shadow-sm"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>

      <!-- Header Info -->
      <div class="space-y-4">
        <h1 class="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{{ recipe.title }}</h1>
        
        <div class="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground border-b border-border pb-6">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <ChefHat class="h-3 w-3" />
            </div>
            <span class="text-foreground">By {{ recipe.creator_name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Clock class="h-4 w-4 text-orange-400" />
            <span>Prep: {{ recipe.prep_time || '--' }} min</span>
          </div>
          <div class="flex items-center gap-2">
            <Utensils class="h-4 w-4 text-orange-400" />
            <span>Cook: {{ recipe.cook_time || '--' }} min</span>
          </div>
        </div>

        <p class="text-lg text-foreground/80 leading-relaxed italic border-l-4 border-primary/30 pl-4 py-2 bg-muted/10">
          {{ recipe.description }}
        </p>
      </div>
    </header>

    <!-- Split Content: Ingredients (Left) / Instructions (Right) -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-12">
      
      <!-- Ingredients Sidebar -->
      <div class="md:col-span-4 space-y-6">
        <div class="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
          <h3 class="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            Ingredients
          </h3>

          <!-- Serving Scaler (+/- Stepper) -->
          <div class="flex items-center justify-between bg-muted/50 p-3 rounded-lg mb-6">
            <span class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Servings</span>
            <div class="flex items-center gap-3">
              <button 
                @click="decrementServings"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-border text-foreground hover:bg-secondary hover:text-primary transition-colors disabled:opacity-50"
                :disabled="targetServings <= 1"
              >
                <Minus class="h-4 w-4" />
              </button>
              <span class="text-lg font-bold text-foreground w-6 text-center">{{ targetServings }}</span>
              <button 
                @click="incrementServings"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-border text-foreground hover:bg-secondary hover:text-primary transition-colors"
              >
                <Plus class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Ingredient List -->
          <ul class="space-y-4">
            <li 
              v-for="ing in recipe.ingredients" 
              :key="ing.id"
              class="flex items-start justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
            >
              <span class="text-foreground/90 font-medium">{{ ing.name }}</span>
              <span class="text-muted-foreground font-semibold text-right min-w-[80px]">
                {{ scaleAmount(ing.amount, recipe.servings) }} 
                <span class="text-xs font-normal ml-0.5">{{ ing.unit !== 'unit' ? ing.unit : '' }}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Instructions Main Content -->
      <div class="md:col-span-8 space-y-8">
        <h3 class="text-2xl font-extrabold text-foreground pb-4 border-b border-border">Directions</h3>
        
        <div class="space-y-8">
          <div 
            v-for="step in recipe.instructions" 
            :key="step.id"
            class="flex gap-6 group"
          >
            <!-- Prominent Number -->
            <div class="flex-shrink-0 flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
                {{ step.step_number }}
              </div>
              <div class="h-full w-px bg-border mt-4 group-last:hidden"></div>
            </div>
            
            <!-- Step Description -->
            <div class="pt-2 pb-6">
              <p class="text-lg text-foreground/90 leading-relaxed">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
