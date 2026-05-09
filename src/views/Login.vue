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

const isSignUp = ref(false)
const isLoading = ref(false)
const errorMsg = ref<string | null>(null)

const email = ref('')
const password = ref('')
const displayName = ref('')

const handleSubmit = async () => {
  isLoading.value = true
  errorMsg.value = null

  try {
    if (isSignUp.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            display_name: displayName.value || email.value.split('@')[0]
          }
        }
      })
      if (error) throw error
      alert('Check your email for the confirmation link!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })
      if (error) throw error
      router.push('/')
    }
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
          {{ isSignUp ? 'Create an account' : 'Welcome back' }}
        </CardTitle>
        <CardDescription class="text-muted-foreground text-base">
          {{ isSignUp ? 'Sign up to start sharing your favorite recipes.' : 'Sign in to access your shared recipe catalog.' }}
        </CardDescription>
      </CardHeader>
      
      <form @submit.prevent="handleSubmit">
        <CardContent class="grid gap-5">
          <div v-if="errorMsg" class="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {{ errorMsg }}
          </div>

          <div v-if="isSignUp" class="grid gap-2">
            <Label for="displayName">Display Name</Label>
            <Input 
              id="displayName" 
              type="text" 
              placeholder="Your Name" 
              v-model="displayName"
              required
            />
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
            {{ isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In') }}
          </Button>
          
          <div class="text-center text-sm text-muted-foreground">
            {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
            <button 
              type="button" 
              @click="isSignUp = !isSignUp" 
              class="ml-1 font-semibold text-primary hover:underline"
            >
              {{ isSignUp ? 'Sign In' : 'Sign Up' }}
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
