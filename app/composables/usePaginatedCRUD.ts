import type { ApiResponse, ApiResult } from '~/types/api'

export interface PaginatedData<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface UsePaginatedCRUDOptions<T, C, U> {
  endpoint: string
  transformResponse?: (data: T) => T
}

export interface UsePaginatedCRUDReturn<T, C, U> {
  items: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  totalElements: Ref<number>
  currentPage: Ref<number>
  totalPages: Ref<number>
  fetchAll: (page?: number, size?: number) => Promise<T[]>
  fetchDeleted: (page?: number, size?: number) => Promise<T[]>
  getById: (id: string) => Promise<T | null>
  create: (data: C) => Promise<ApiResult<T>>
  update: (id: string, data: U) => Promise<ApiResult<T>>
  delete: (id: string) => Promise<ApiResult<void>>
}

export const usePaginatedCRUD = <T, C, U>(
  options: UsePaginatedCRUDOptions<T, C, U>
): UsePaginatedCRUDReturn<T, C, U> => {
  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const handleError = (err: unknown, defaultMessage: string): string => {
    const e = err as { data?: { message?: string } }
    const message = e.data?.message || defaultMessage
    error.value = message
    return message
  }

  const fetchAll = async (page: number = 0, size: number = 10): Promise<T[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<PaginatedData<T>>>(options.endpoint, {
        params: { page, size }
      })

      if (response.success && response.data) {
        items.value = response.data.content.map(item =>
          options.transformResponse ? options.transformResponse(item) : item
        )
        totalElements.value = response.data.totalElements || 0
        totalPages.value = response.data.totalPages || 0
        currentPage.value = response.data.number || 0
        return items.value
      }
      error.value = response.message || 'Error al cargar datos'
      return []
    } catch (err: unknown) {
      handleError(err, 'Error al cargar datos')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeleted = async (page: number = 0, size: number = 10): Promise<T[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<PaginatedData<T>>>(`${options.endpoint}/deleted`, {
        params: { page, size }
      })

      if (response.success && response.data) {
        items.value = response.data.content.map(item =>
          options.transformResponse ? options.transformResponse(item) : item
        )
        totalElements.value = response.data.totalElements || 0
        totalPages.value = response.data.totalPages || 0
        currentPage.value = response.data.number || 0
        return items.value
      }
      error.value = response.message || 'Error al cargar datos eliminados'
      return []
    } catch (err: unknown) {
      handleError(err, 'Error al cargar datos eliminados')
      return []
    } finally {
      loading.value = false
    }
  }

  const getById = async (id: string): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<T>>(`${options.endpoint}/${id}`)

      if (response.success && response.data) {
        return options.transformResponse
          ? options.transformResponse(response.data)
          : response.data
      }
      error.value = response.message || 'No encontrado'
      return null
    } catch (err: unknown) {
      handleError(err, 'Error al obtener datos')
      return null
    } finally {
      loading.value = false
    }
  }

  const create = async (data: C): Promise<ApiResult<T>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<T>>(options.endpoint, {
        method: 'POST',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: data as any
      })

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Creado exitosamente',
          data: response.data
        }
      }
      return { success: false, message: response.message || 'Error al crear' }
    } catch (err: unknown) {
      const msg = handleError(err, 'Error al crear')
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const update = async (id: string, data: U): Promise<ApiResult<T>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<T>>(`${options.endpoint}/${id}`, {
        method: 'PUT',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: data as any
      })

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Actualizado exitosamente',
          data: response.data
        }
      }
      return { success: false, message: response.message || 'Error al actualizar' }
    } catch (err: unknown) {
      const msg = handleError(err, 'Error al actualizar')
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const deleteItem = async (id: string): Promise<ApiResult<void>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`${options.endpoint}/${id}`, {
        method: 'DELETE'
      })

      return {
        success: response.success,
        message: response.message || (response.success ? 'Eliminado' : 'Error')
      }
    } catch (err: unknown) {
      const msg = handleError(err, 'Error al eliminar')
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchAll,
    fetchDeleted,
    getById,
    create,
    update,
    delete: deleteItem
  }
}