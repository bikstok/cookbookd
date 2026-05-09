import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { Recipe, Ingredient, Instruction, Tag } from '@/types/database'

export interface FullRecipe extends Omit<Recipe, 'ingredient_names' | 'tags'> {
  creator_name: string
  tags: Tag[]
  ingredients: Ingredient[]
  instructions: Instruction[]
}

export function useRecipeDetail(recipeId: string) {
  const recipe = ref<FullRecipe | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  const fetchRecipe = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles (display_name),
          recipe_tags (
            tags (*)
          ),
          ingredients (*),
          instructions (*)
        `)
        .eq('id', recipeId)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error('Recipe not found')

      const sortedIngredients = (data.ingredients || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      const sortedInstructions = (data.instructions || []).sort((a: any, b: any) => a.step_number - b.step_number)

      recipe.value = {
        ...data,
        creator_name: data.profiles?.display_name || 'Unknown',
        tags: data.recipe_tags?.map((rt: any) => rt.tags).filter(Boolean) || [],
        ingredients: sortedIngredients,
        instructions: sortedInstructions
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching recipe details:', err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    if (recipeId) fetchRecipe()
  })

  watch(() => recipeId, (newId) => {
    if (newId) fetchRecipe()
  })

  return {
    recipe,
    isLoading,
    error,
    fetchRecipe
  }
}

