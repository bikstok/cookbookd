import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { RecipeSummary } from '@/types/database'
import Fuse from 'fuse.js'

export function useRecipeSearch() {
  const recipes = ref<RecipeSummary[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const fuseOptions = {
    keys: ['title', 'tags', 'ingredient_names', 'description'],
    threshold: 0.3,
    distance: 100,
  }

  const fetchRecipes = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // Fetch recipes with tags and ingredients in one go
      const { data, error: supabaseError } = await supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          image_url,
          created_by,
          profiles (display_name),
          recipe_tags (
            tags (name)
          ),
          ingredients (name)
        `)

      if (supabaseError) throw supabaseError

      // Transform data into RecipeSummary format
      recipes.value = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        image_url: r.image_url,
        created_by_name: r.profiles?.display_name || 'Unknown',
        tags: r.recipe_tags?.map((rt: any) => rt.tags?.name).filter(Boolean) || [],
        ingredient_names: r.ingredients?.map((i: any) => i.name) || []
      }))
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching recipes:', e)
    } finally {
      isLoading.value = false
    }
  }

  const fuse = computed(() => new Fuse(recipes.value, fuseOptions))

  const filteredRecipes = computed(() => {
    if (!searchQuery.value) return recipes.value
    return fuse.value.search(searchQuery.value).map(result => result.item)
  })

  return {
    searchQuery,
    isLoading,
    error,
    filteredRecipes,
    fetchRecipes,
  }
}
