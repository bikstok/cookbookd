<script setup lang="ts">
import { ref, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/composables/useAuth'
import { useImageUpload } from '@/composables/useImageUpload'
import TagInput from '../components/recipes/TagInput.vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Utensils, Clock, Users, Camera, Save } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

const props = defineProps<{
  id?: string
}>()

const router = useRouter()
const { user } = useAuth()
const { uploadRecipeImage, isUploading } = useImageUpload()
const fileInputRef = useTemplateRef<HTMLInputElement>('fileInput')

// Form State
const title = ref('')
const description = ref('')
const prepTime = ref<string | number>('')
const cookTime = ref<string | number>('')
const servings = ref<string | number>(4)
const ingredients = ref<{ amount: string | number, unit: string, name: string }[]>([
  { amount: '', unit: '', name: '' }
])
const instructions = ref<string[]>([''])
const selectedTags = ref<string[]>([]) // Array of tag names
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const isSaving = ref(false)
const importJson = ref('')
const isImportDialogOpen = ref(false)

const handleImportJSON = () => {
  try {
    let rawText = importJson.value.trim()
    
    // Support markdown code blocks (e.g. ```json ... ```)
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      rawText = jsonMatch[1]
    }

    const data = JSON.parse(rawText)

    // Map to form state
    if (data.title) title.value = data.title
    if (data.description) description.value = data.description
    if (data.prep_time) prepTime.value = data.prep_time
    if (data.cook_time) cookTime.value = data.cook_time
    if (data.servings) servings.value = data.servings
    
    if (Array.isArray(data.ingredients)) {
      ingredients.value = data.ingredients.map((i: any) => ({
        amount: i.amount || '',
        unit: i.unit || '',
        name: i.name || ''
      }))
    }

    if (Array.isArray(data.instructions)) {
      instructions.value = data.instructions.map((i: any) => typeof i === 'string' ? i : i.description)
    }

    if (Array.isArray(data.tags)) {
      selectedTags.value = data.tags
    }

    // Reset and Close
    importJson.value = ''
    isImportDialogOpen.value = false
    alert('Recipe imported successfully!')
  } catch (err: any) {
    alert('Failed to parse JSON. Please check the format. Error: ' + err.message)
  }
}

const handleGlobalPaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const file = items[i].getAsFile()
      if (file) {
        imageFile.value = file
        imagePreview.value = URL.createObjectURL(file)
        console.log('Image pasted from clipboard!')
        break
      }
    }
  }
}

// Load existing recipe if editing
onMounted(async () => {
  window.addEventListener('paste', handleGlobalPaste)
  
  if (props.id) {
    const { data, error: fetchError } = await supabase
      .from('recipes')
      .select('*, ingredients(*), instructions(*), recipe_tags(tags(name))')
      .eq('id', props.id)
      .single()

    if (fetchError) {
      console.error('Error fetching recipe:', fetchError.message)
      return
    }

    if (data) {
      title.value = data.title
      description.value = data.description || ''
      prepTime.value = data.prep_time || ''
      cookTime.value = data.cook_time || ''
      servings.value = data.servings
      imagePreview.value = data.image_url
      
      if (data.ingredients?.length) {
        ingredients.value = data.ingredients.map((i: any) => ({
          amount: i.amount || '',
          unit: i.unit === 'unit' ? '' : i.unit,
          name: i.name
        }))
      }
      
      if (data.instructions?.length) {
        instructions.value = data.instructions
          .sort((a: any, b: any) => a.step_number - b.step_number)
          .map((i: any) => i.description)
      }
      
      if (data.recipe_tags?.length) {
        selectedTags.value = data.recipe_tags.map((rt: any) => rt.tags.name)
      }
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('paste', handleGlobalPaste)
})

// Handlers
const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0]
    imagePreview.value = URL.createObjectURL(target.files[0])
  }
}

const addIngredient = () => {
  ingredients.value.push({ amount: '', unit: '', name: '' })
}

const removeIngredient = (index: number) => {
  ingredients.value.splice(index, 1)
}

const addInstruction = () => {
  instructions.value.push('')
}

const removeInstruction = (index: number) => {
  instructions.value.splice(index, 1)
}

const handleDelete = async () => {
  if (!props.id) return
  
  isSaving.value = true
  try {
    const { error } = await supabase.from('recipes').delete().eq('id', props.id)
    if (error) throw error
    router.push('/')
  } catch (err: any) {
    alert('Failed to delete recipe: ' + err.message)
  } finally {
    isSaving.value = false
  }
}

const handleSave = async () => {
  if (!user.value) {
    alert('You must be logged in to save a recipe.')
    return
  }

  // VALIDATION
  if (!title.value.trim()) {
    alert('Please enter a Recipe Title.')
    return
  }

  if (selectedTags.value.length === 0) {
    alert('Please select at least one Tag.')
    return
  }

  isSaving.value = true

  try {
    let finalImageUrl = imagePreview.value

    // 1. Upload image ONLY if a new local file was actually selected
    if (imageFile.value) {
      console.log('Uploading new image file...', imageFile.value.name)
      const uploadedUrl = await uploadRecipeImage(imageFile.value)
      
      if (!uploadedUrl) {
        throw new Error('Image upload failed. Please check your Supabase storage permissions.')
      }
      
      finalImageUrl = uploadedUrl
      console.log('Image uploaded successfully:', finalImageUrl)
    }

    // 2. Upsert Recipe
    const recipeData = {
      title: title.value,
      description: description.value,
      prep_time: Number(prepTime.value) || null,
      cook_time: Number(cookTime.value) || null,
      servings: Number(servings.value) || 4,
      image_url: finalImageUrl,
      created_by: user.value.id
    }

    let recipeId = props.id
    if (recipeId) {
      await supabase.from('recipes').update(recipeData).eq('id', recipeId)
    } else {
      const { data } = await supabase.from('recipes').insert(recipeData).select().single()
      recipeId = data?.id
    }

    if (!recipeId) throw new Error('Failed to save recipe')

    // 3. Handle Relational Data (Delete old and re-insert for simplicity)
    const deleteOps = [
      supabase.from('ingredients').delete().eq('recipe_id', recipeId),
      supabase.from('instructions').delete().eq('recipe_id', recipeId)
    ]
    if (props.id) {
       deleteOps.push(supabase.from('recipe_tags').delete().eq('recipe_id', recipeId))
    }
    await Promise.all(deleteOps)

    // 4. Handle Tags (Ensure they exist, then link)
    const tagLinks = []
    if (selectedTags.value.length > 0) {
      // Upsert tags to ensure they exist
      const { data: tagsData, error: tagsUpsertError } = await supabase
        .from('tags')
        .upsert(selectedTags.value.map(name => ({ name })), { onConflict: 'name' })
        .select('id')

      if (tagsUpsertError) throw new Error(`Tag Creation Failed: ${tagsUpsertError.message}`)

      if (tagsData) {
        tagLinks.push(...tagsData.map(t => ({ recipe_id: recipeId, tag_id: t.id })))
      }
    }

    const insertOps = [
      supabase.from('ingredients').insert(
        ingredients.value.filter(i => i.name).map((i, idx) => ({
          recipe_id: recipeId,
          amount: Number(i.amount) || null,
          unit: i.unit || 'unit',
          name: i.name,
          sort_order: idx
        }))
      ).then(({ error }) => { if (error) throw new Error(`Ingredients Save Failed: ${error.message}`) }),
      
      supabase.from('instructions').insert(
        instructions.value.filter(i => i).map((i, idx) => ({
          recipe_id: recipeId,
          step_number: idx + 1,
          description: i
        }))
      ).then(({ error }) => { if (error) throw new Error(`Instructions Save Failed: ${error.message}`) })
    ]
    
    if (tagLinks.length > 0) {
      insertOps.push(
        supabase.from('recipe_tags').insert(tagLinks)
          .then(({ error }) => { if (error) throw new Error(`Tag Linking Failed: ${error.message}`) })
      )
    }
    
    await Promise.all(insertOps)

    router.push(`/recipe/${recipeId}`)
  } catch (err: any) {
    alert(err.message || 'Error saving recipe')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto pb-20">
      <header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-4xl font-extrabold text-foreground tracking-tight mb-2">
            {{ id ? 'Edit Recipe' : 'Share a New Recipe' }}
          </h1>
          <p class="text-muted-foreground text-lg">Add your culinary masterpiece to our shared catalog.</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <!-- Gemini Import Dialog -->
          <Dialog v-model:open="isImportDialogOpen">
            <DialogTrigger as-child>
              <Button 
                variant="outline"
                size="lg"
                class="rounded-full px-6 border-primary/20 text-primary hover:bg-primary/5"
              >
                <Plus class="mr-2 h-5 w-5" />
                Import from Gemini
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Smart Recipe Import</DialogTitle>
                <DialogDescription>
                  Paste the JSON block provided by Gemini below to instantly fill out the form.
                </DialogDescription>
              </DialogHeader>
              <div class="py-4">
                <Textarea 
                  v-model="importJson" 
                  placeholder='{"title": "..."}' 
                  class="min-h-[200px] font-mono text-xs"
                />
              </div>
              <DialogFooter>
                <Button @click="handleImportJSON">Import Recipe</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog v-if="id">
            <DialogTrigger as-child>
              <Button 
                variant="destructive"
                size="lg"
                :disabled="isSaving || isUploading"
                class="rounded-full px-8 shadow-lg shadow-destructive/20"
              >
                <Trash2 class="mr-2 h-5 w-5" />
                Delete Recipe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your recipe
                  and remove it from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose as-child>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" @click="handleDelete" :disabled="isSaving">
                  <Trash2 class="mr-2 h-4 w-4" /> Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            size="lg" 
            @click="handleSave" 
            :disabled="isSaving || isUploading"
            class="rounded-full px-8 shadow-lg shadow-primary/20"
          >
            <Save v-if="!isSaving" class="mr-2 h-5 w-5" />
            <span v-else class="mr-2 animate-spin">⏳</span>
            {{ isSaving ? 'Saving...' : 'Save Recipe' }}
          </Button>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Main Form (Left) -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Basic Info -->
          <Card class="border-border shadow-sm">
            <CardHeader>
              <CardTitle class="text-xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-2">
                <Label for="title" class="flex items-center gap-1">
                  Recipe Title <span class="text-destructive">*</span>
                </Label>
                <Input id="title" v-model="title" placeholder="e.g. Grandma's Famous Lasagna" class="text-lg" required />
              </div>
              
              <div class="space-y-2">
                <Label for="description">Short Description</Label>
                <Textarea 
                  id="description" 
                  v-model="description" 
                  placeholder="Tell us a bit about this dish..." 
                  class="min-h-[100px] resize-none"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label class="flex items-center gap-2">
                    <Clock class="h-4 w-4 text-orange-600" /> Prep Time (min)
                  </Label>
                  <Input type="number" v-model="prepTime" placeholder="20" />
                </div>
                <div class="space-y-2">
                  <Label class="flex items-center gap-2">
                    <Utensils class="h-4 w-4 text-orange-600" /> Cook Time (min)
                  </Label>
                  <Input type="number" v-model="cookTime" placeholder="45" />
                </div>
                <div class="space-y-2">
                  <Label class="flex items-center gap-2">
                    <Users class="h-4 w-4 text-orange-600" /> Servings
                  </Label>
                  <Input type="number" v-model="servings" placeholder="4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Ingredients Section -->
          <Card class="border-border shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle class="text-xl">Ingredients</CardTitle>
              <Button variant="outline" size="sm" @click="addIngredient" class="rounded-full">
                <Plus class="h-4 w-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div 
                  v-for="(ing, idx) in ingredients" 
                  :key="idx"
                  class="flex items-center gap-2 group"
                >
                  <Input type="number" v-model="ing.amount" placeholder="Qty" class="w-20" />
                  <Input v-model="ing.unit" placeholder="Unit" class="w-24" />
                  <Input v-model="ing.name" placeholder="Ingredient name" class="flex-1" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    @click="removeIngredient(idx)"
                    class="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Instructions Section -->
          <Card class="border-border shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle class="text-xl">Instructions</CardTitle>
              <Button variant="outline" size="sm" @click="addInstruction" class="rounded-full">
                <Plus class="h-4 w-4 mr-1" /> Add Step
              </Button>
            </CardHeader>
            <CardContent>
              <div class="space-y-6">
                <div 
                  v-for="(_, idx) in instructions" 
                  :key="idx"
                  class="flex gap-4 group"
                >
                  <div class="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-sm">
                    {{ idx + 1 }}
                  </div>
                  <Textarea 
                    v-model="instructions[idx]" 
                    placeholder="Describe this step..." 
                    class="min-h-[80px] resize-none"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    @click="removeInstruction(idx)"
                    class="text-muted-foreground hover:text-destructive transition-colors mt-2"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Sidebar (Right) -->
        <div class="space-y-8">
          
          <!-- Image Upload Card -->
          <Card class="border-border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle class="text-xl">Recipe Photo</CardTitle>
            </CardHeader>
            <CardContent class="p-0">
              <div 
                @click="fileInputRef?.click()"
                class="aspect-square bg-muted flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors relative"
              >
                <template v-if="imagePreview">
                  <img :src="imagePreview" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span class="text-white font-semibold flex items-center gap-2">
                      <Camera class="h-5 w-5" /> Change Photo
                    </span>
                  </div>
                </template>
                <template v-else>
                  <Camera class="h-12 w-12 text-muted-foreground/40 mb-2" />
                  <span class="text-sm font-medium text-muted-foreground">Upload an image</span>
                </template>
                <input 
                  type="file" 
                  ref="fileInput" 
                  class="hidden" 
                  accept="image/*" 
                  @change="handleImageChange"
                />
              </div>
            </CardContent>
          </Card>

          <!-- Tags Card -->
          <Card class="border-border shadow-sm">
            <CardHeader>
              <CardTitle class="text-xl">Categories</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label for="tags" class="flex items-center gap-1">
                  Tags <span class="text-destructive">*</span>
                </Label>
                <TagInput v-model="selectedTags" />
                <p class="text-[10px] text-muted-foreground italic uppercase tracking-wider font-bold">Select at least one tag</p>
              </div>
            </CardContent>
          </Card>

          <!-- Tips Section -->
          <div class="bg-orange-50/50 rounded-xl p-6 border border-orange-100">
            <h4 class="font-bold text-orange-900 mb-2 flex items-center gap-2">
              💡 Pro Tip
            </h4>
            <p class="text-sm text-orange-800/80 leading-relaxed">
              Good photos help others find your recipes! Try to take photos in natural light for the best result.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
