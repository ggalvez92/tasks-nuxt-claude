import { defineStore } from 'pinia'
import type { Category } from '~/shared/types'

export interface CreateCategoryInput {
  name: string
  color: string
  description?: string
}

export interface UpdateCategoryInput {
  name?: string
  color?: string
  description?: string
}

export const useCategoriesStore = defineStore('categories', () => {
  const categoriesApi = useCategoriesApi()

  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // Getters
  const getCategoryById = computed(() => {
    return (id: string) => categories.value.find(c => c.id === id)
  })

  const getCategoryByName = computed(() => {
    return (name: string) => categories.value.find(c => c.name.toLowerCase() === name.toLowerCase())
  })

  // Actions

  /**
   * Cargar todas las categorías desde el backend
   */
  async function fetchCategories(): Promise<void> {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const data = await categoriesApi.getCategories()
      categories.value = data
      initialized.value = true
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch categories'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear nueva categoría en el backend
   */
  async function createCategory(input: CreateCategoryInput): Promise<Category | null> {
    loading.value = true
    error.value = null

    try {
      const category = await categoriesApi.createCategory(input)
      categories.value.push(category)
      return category
    } catch (err: any) {
      error.value = err.message || 'Failed to create category'
      console.error('Error creating category:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar categoría en el backend
   */
  async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category | null> {
    loading.value = true
    error.value = null

    try {
      const updatedCategory = await categoriesApi.updateCategory(id, input)
      const index = categories.value.findIndex(c => c.id === id)

      if (index !== -1) {
        categories.value[index] = updatedCategory
      }

      return updatedCategory
    } catch (err: any) {
      error.value = err.message || 'Failed to update category'
      console.error('Error updating category:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar categoría del backend
   */
  async function deleteCategory(id: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await categoriesApi.deleteCategory(id)
      const index = categories.value.findIndex(c => c.id === id)

      if (index !== -1) {
        categories.value.splice(index, 1)
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete category'
      console.error('Error deleting category:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicializar store (cargar categorías)
   */
  async function initialize(): Promise<void> {
    if (!initialized.value) {
      await fetchCategories()
    }
  }

  /**
   * Limpiar state (útil para logout)
   */
  function clear(): void {
    categories.value = []
    initialized.value = false
    error.value = null
    loading.value = false
  }

  return {
    // State
    categories,
    loading,
    error,
    initialized,

    // Getters
    getCategoryById,
    getCategoryByName,

    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    initialize,
    clear
  }
})