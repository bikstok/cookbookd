import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export function useImageUpload() {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)

  const uploadRecipeImage = async (file: File) => {
    isUploading.value = true
    uploadError.value = null

    try {
      // 1. Generate a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `recipes/${fileName}`

      // 2. Upload file to Supabase Storage
      const { error: uploadErrorData } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, file)

      if (uploadErrorData) throw uploadErrorData

      // 3. Get the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err: any) {
      uploadError.value = err.message
      console.error('Error uploading image:', err)
      return null
    } finally {
      isUploading.value = false
    }
  }

  return {
    isUploading,
    uploadError,
    uploadRecipeImage
  }
}
