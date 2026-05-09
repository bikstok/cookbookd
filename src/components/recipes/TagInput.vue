<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Check, ChevronsUpDown, X, Plus, Loader2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const open = ref(false)
const allTags = ref<{ id: string, name: string }[]>([])
const isLoading = ref(false)
const searchTerm = ref('')

const fetchAllTags = async () => {
  isLoading.value = true
  const { data } = await supabase.from('tags').select('id, name')
  if (data) allTags.value = data
  isLoading.value = false
}

onMounted(fetchAllTags)

const toggleTag = (tagName: string) => {
  const current = [...props.modelValue]
  const index = current.indexOf(tagName)
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(tagName)
  }
  emit('update:modelValue', current)
}

const removeTag = (tagName: string) => {
  emit('update:modelValue', props.modelValue.filter(t => t !== tagName))
}

const createNewTag = () => {
  const newTag = searchTerm.value.trim()
  if (newTag && !props.modelValue.includes(newTag)) {
    emit('update:modelValue', [...props.modelValue, newTag])
    if (!allTags.value.find(t => t.name.toLowerCase() === newTag.toLowerCase())) {
       allTags.value.push({ id: '', name: newTag })
    }
  }
  searchTerm.value = ''
  open.value = false
}

// Manual filtering to ensure "Create New" visibility is perfect
const filteredTags = computed(() => {
  if (!searchTerm.value) return allTags.value
  return allTags.value.filter(t => 
    t.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const showCreateOption = computed(() => {
  if (!searchTerm.value) return false
  return !allTags.value.some(t => t.name.toLowerCase() === searchTerm.value.toLowerCase())
})
</script>

<template>
  <div class="space-y-3">
    <!-- Selected Tags Display -->
    <div v-if="modelValue.length > 0" class="flex flex-wrap gap-2">
      <Badge 
        v-for="tag in modelValue" 
        :key="tag" 
        variant="secondary"
        class="pl-3 pr-1 py-1 gap-1 bg-orange-100 text-orange-800 hover:bg-orange-200 border-none rounded-full"
      >
        {{ tag }}
        <button 
          type="button"
          @click.stop="removeTag(tag)"
          class="hover:bg-orange-300/50 rounded-full p-0.5 transition-colors"
        >
          <X class="h-3 w-3" />
        </button>
      </Badge>
    </div>

    <!-- Combobox Trigger -->
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          class="w-full justify-between bg-white border-border rounded-lg h-10"
        >
          <span class="text-muted-foreground font-normal">
            {{ modelValue.length > 0 ? 'Add more tags...' : 'Select or create tags...' }}
          </span>
          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[300px] p-0" align="start">
        <Command :filter-function="(list: string[], term: string) => list.filter(i => i.toLowerCase().includes(term.toLowerCase()))">
          <CommandInput placeholder="Search tags..." v-model="searchTerm" />
          <CommandList>
            <div v-if="isLoading" class="p-4 flex justify-center">
              <Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
            </div>

            <!-- Create New Option -->
            <div v-if="showCreateOption" class="p-1 border-b">
              <Button 
                variant="ghost" 
                class="w-full justify-start text-primary font-semibold py-4 h-auto rounded-md"
                @click="createNewTag"
              >
                <Plus class="mr-2 h-4 w-4" />
                Create "{{ searchTerm }}"
              </Button>
            </div>

            <CommandEmpty v-if="!showCreateOption && !isLoading && filteredTags.length === 0">
              No tags found.
            </CommandEmpty>

            <CommandGroup v-if="!isLoading">
              <CommandItem
                v-for="tag in filteredTags"
                :key="tag.id || tag.name"
                :value="tag.name"
                @select="() => {
                  toggleTag(tag.name)
                  open = false
                }"
              >
                <Check
                  :class="cn(
                    'mr-2 h-4 w-4',
                    modelValue.includes(tag.name) ? 'opacity-100' : 'opacity-0'
                  )"
                />
                {{ tag.name }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
