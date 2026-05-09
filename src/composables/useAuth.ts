import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)

export function useAuth() {
  const isLoading = ref(true)

  const fetchSession = async () => {
    isLoading.value = true
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user || null
    isLoading.value = false
  }

  // Set up auth state listener
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
  })

  onMounted(() => {
    fetchSession()
  })

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error.message)
    user.value = null
  }

  return {
    user,
    isLoading,
    signOut
  }
}
