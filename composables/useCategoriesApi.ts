/**
 * Categories API Composable
 * Wrapper para todas las llamadas al backend de categories
 */

import type { Category } from "~/shared/types";

// export interface CreateCategoryInput {
//   name: string;
//   color: string;
//   description?: string;
// }

// export interface UpdateCategoryInput {
//   name?: string;
//   color?: string;
//   description?: string;
// }

export const useCategoriesApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.backendApiUrl;

  // Helper para manejar errores de forma consistente
  const handleError = (error: any): never => {
    if (error.data) {
      throw new Error(error.data.message || "An error occurred");
    }
    throw new Error(error.message || "An unexpected error occurred");
  };

  /**
   * CATEGORIES ENDPOINTS
   */

  const getCategories = async (): Promise<Category[]> => {
    try {
      const data = await $fetch<Category[]>("/api/backend/categories", {
        method: "GET",
        credentials: "include",
      });

      console.log(
        "🔍 [COMPOSABLE] Categories response type:",
        typeof data,
        "Is array:",
        Array.isArray(data)
      );

      // Verificar que sea un array
      if (!Array.isArray(data)) {
        console.error("❌ [COMPOSABLE] Categories data is not an array:", data);
        return [];
      }

      // Convertir fechas de string a Date
      return data.map((category) => ({
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      }));
    } catch (error: any) {
      console.error("❌ [COMPOSABLE] Error in getCategories:", error);
      return handleError(error);
    }
  };

  const getCategory = async (id: string): Promise<Category> => {
    try {
      const data = await $fetch<Category>(`/api/backend/categories/${id}`, {
        method: "GET",
        credentials: "include",
      });

      // Convertir fechas de string a Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error: any) {
      return handleError(error);
    }
  };

  const createCategory = async (
    input: CreateCategoryInput
  ): Promise<Category> => {
    try {
      const data = await $fetch<Category>("/api/backend/categories", {
        method: "POST",
        body: input,
        credentials: "include",
      });

      // Convertir fechas de string a Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error: any) {
      return handleError(error);
    }
  };

  const updateCategory = async (
    id: string,
    input: UpdateCategoryInput
  ): Promise<Category> => {
    try {
      const data = await $fetch<Category>(`/api/backend/categories/${id}`, {
        method: "PATCH",
        body: input,
        credentials: "include",
      });

      // Convertir fechas de string a Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error: any) {
      return handleError(error);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/backend/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error: any) {
      return handleError(error);
    }
  };

  return {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
