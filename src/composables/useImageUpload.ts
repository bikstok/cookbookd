import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import imageCompression from 'browser-image-compression'

export function useImageUpload() {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)

  const uploadRecipeImage = async (file: File) => {
    isUploading.value = true
    uploadError.value = null

    try {
      // 1. Compress Image
      const options = {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/webp' as string
      }
      
      const compressedFile = await imageCompression(file, options)

      // 2. Generate a unique file name (always .webp)
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.webp`
      const filePath = `recipes/${fileName}`

      // 3. Upload file to Supabase Storage
      const { error: uploadErrorData } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, compressedFile, {
          contentType: 'image/webp',
          upsert: true
        })

      if (uploadErrorData) throw uploadErrorData

      // 4. Get the Public URL
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

  const deleteRecipeImage = async (imageUrl: string) => {
    try {
      const urlParts = imageUrl.split('/recipe-images/')
      if (urlParts.length !== 2) return false
      
      const filePath = urlParts[1].split('?')[0]
      
      const { error } = await supabase.storage
        .from('recipe-images')
        .remove([filePath])
        
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error deleting image:', err)
      return false
    }
  }

  return {
    isUploading,
    uploadError,
    uploadRecipeImage,
    deleteRecipeImage
  }
}
