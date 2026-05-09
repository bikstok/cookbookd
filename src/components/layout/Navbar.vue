<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import { Sun, Moon } from 'lucide-vue-next'

const router = useRouter()
const { user, signOut } = useAuth()
const { isDark, toggleTheme } = useTheme()
const isMenuOpen = ref(false)

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'New Recipe', path: '/edit' },
]

const navigate = (path: string) => {
  router.push(path)
  isMenuOpen.value = false
}

const handleSignOut = async () => {
  await signOut()
  navigate('/')
}
</script>

<template>
  <nav class="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center cursor-pointer" @click="navigate('/')">
          <span class="text-xl font-bold tracking-tight">CookBook'd</span>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden sm:flex items-center gap-8">
          <button 
            v-for="item in navItems" 
            :key="item.path"
            @click="navigate(item.path)"
            class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {{ item.name }}
          </button>
          
          <div class="flex items-center gap-4">
            <button 
              @click="toggleTheme" 
              class="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent"
              aria-label="Toggle theme"
            >
              <Sun v-if="isDark" class="h-5 w-5" />
              <Moon v-else class="h-5 w-5" />
            </button>

            <div v-if="user" class="flex items-center gap-4">
              <span class="text-sm font-semibold text-orange-900/60">
                Hi, {{ user.user_metadata.display_name || user.email?.split('@')[0] }}
              </span>
              <Button 
                variant="outline"
                size="sm"
                @click="handleSignOut"
                class="rounded-full px-6 border-primary/20 hover:bg-primary/10"
              >
                Log Out
              </Button>
            </div>
            <Button 
              v-else
              variant="default"
              size="sm"
              @click="navigate('/login')"
              class="rounded-full px-6"
            >
              Sign In
            </Button>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <div class="sm:hidden">
          <button 
            @click="isMenuOpen = !isMenuOpen"
            class="p-2 text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMenuOpen" class="sm:hidden bg-background border-b border-border px-4 py-4 space-y-2">
      <div class="flex items-center justify-between px-4 py-2 border-b border-border mb-2">
        <span class="text-sm font-medium text-muted-foreground tracking-tight">Theme</span>
        <button 
          @click="toggleTheme" 
          class="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full bg-accent/50"
          aria-label="Toggle theme"
        >
          <Sun v-if="isDark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </button>
      </div>

      <button 
        v-for="item in navItems" 
        :key="item.path"
        @click="navigate(item.path)"
        class="block w-full text-left px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg"
      >
        {{ item.name }}
      </button>
      
      <template v-if="user">
        <div class="px-4 py-2 text-sm font-semibold text-orange-900/60 border-t border-border mt-2 pt-4">
          Logged in as {{ user.user_metadata.display_name || user.email }}
        </div>
        <Button 
          variant="outline"
          class="w-full mt-2"
          @click="handleSignOut"
        >
          Log Out
        </Button>
      </template>
      <Button 
        v-else
        variant="default"
        class="w-full mt-4"
        @click="navigate('/login')"
      >
        Sign In
      </Button>
    </div>
  </nav>
</template>
