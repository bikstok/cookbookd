<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user: _user } = useAuth()

const isLoading = ref(false)
const errorMsg = ref<string | null>(null)

const email = ref('')
const password = ref('')

const handleSubmit = async () => {
  isLoading.value = true
  errorMsg.value = null

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (error) throw error
    router.push('/')
  } catch (err: any) {
    errorMsg.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-muted/20 px-4">
    <Card class="w-full max-w-md shadow-lg border-border bg-card">
      <CardHeader class="space-y-1">
        <CardTitle class="text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back
        </CardTitle>
        <CardDescription class="text-muted-foreground text-base">
          Sign in to access your shared recipe catalog Jakob & Trine.
        </CardDescription>
      </CardHeader>
      
      <form @submit.prevent="handleSubmit">
        <CardContent class="grid gap-5">
          <div v-if="errorMsg" class="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {{ errorMsg }}
          </div>

          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              v-model="email"
              required
            />
          </div>

          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              v-model="password"
              required
            />
          </div>
        </CardContent>

        <CardFooter class="flex flex-col gap-4 mt-2">
          <Button type="submit" class="w-full text-lg h-12" :disabled="isLoading">
            {{ isLoading ? 'Processing...' : 'Sign In' }}
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
