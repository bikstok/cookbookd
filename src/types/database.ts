export interface Profile {
  id: string
  display_name: string
}

export interface Recipe {
  id: string
  title: string
  description: string | null
  prep_time: number | null
  cook_time: number | null
  servings: number
  image_url: string | null
  created_by: string | null
  created_at: string
  // Virtual field for Search
  ingredient_names?: string[]
  tags?: string[]
  // Extra features
  is_favorite?: boolean
  is_public?: boolean
  public_token?: string | null
}

export interface Ingredient {
  id: string
  recipe_id: string
  amount: number | null
  unit: string | null
  name: string
  sort_order: number
}

export interface Instruction {
  id: string
  recipe_id: string
  step_number: number
  description: string
}

export interface Tag {
  id: string
  name: string
  category: string | null
}

export interface RecipeTag {
  recipe_id: string
  tag_id: string
}

export interface Favorite {
  user_id: string
  recipe_id: string
  created_at: string
}

// Summary interface for initial Fuse.js indexing
export interface RecipeSummary {
  id: string
  title: string
  description: string | null
  image_url: string | null
  created_by_name: string
  tags: string[]
  ingredient_names: string[]
}
