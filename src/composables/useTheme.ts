import { ref, onMounted } from "vue"

export function useTheme() {
  const isDark = ref(false)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    if (isDark.value) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("vueuse-color-scheme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("vueuse-color-scheme", "light")
    }
  }

  onMounted(() => {
    const mode = localStorage.getItem("vueuse-color-scheme") || "auto"
    isDark.value =
      mode === "dark" ||
      (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    
    if (isDark.value) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  })

  return {
    isDark,
    toggleTheme
  }
}
