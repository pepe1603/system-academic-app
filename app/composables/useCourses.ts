export interface Course {
  id: string
  courseCode: string
  name: string
  credits: number
  hoursTheory?: number
  hoursPractice?: number
  description?: string
  isMandatory: boolean
  isActive: boolean
  isDeleted: boolean
  createdAt?: string
  studyPlanId: string
  studyPlanCode: string
  studyPlanName: string
  semesterId: string
  semesterName: string
  semesterNumber: number
}

interface CreateCourseData {
  studyPlanId: string
  semesterId: string
  courseCode: string
  name: string
  credits: number
  hoursTheory?: number
  hoursPractice?: number
  description?: string
  isMandatory?: boolean
  isActive?: boolean
}

interface UpdateCourseData {
  studyPlanId?: string
  semesterId?: string
  courseCode?: string
  name?: string
  credits?: number
  hoursTheory?: number
  hoursPractice?: number
  description?: string
  isMandatory?: boolean
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useCourses = () => {
  const courses = ref<Course[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchCourses = async (page: number = 0, size: number = 10): Promise<Course[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Course[]>>('/api/cpanel/courses', {
        query: { page, size }
      })

      if (response.success && response.data) {
        courses.value = response.data
        return courses.value
      }
      error.value = response.message || 'Error al cargar cursos'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar cursos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedCourses = async (): Promise<Course[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Course[]>>('/api/cpanel/courses/deleted')

      if (response.success && response.data) {
        courses.value = response.data
        return courses.value
      }
      error.value = response.message || 'Error al cargar cursos eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar cursos eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getCourse = async (id: string): Promise<Course | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Course>>(`/api/cpanel/courses/${id}`)

      if (response.success && response.data) {
        return response.data
      }
      error.value = response.message || 'Curso no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener curso'
      return null
    } finally {
      loading.value = false
    }
  }

  const createCourse = async (data: CreateCourseData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Course>>('/api/cpanel/courses', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchCourses(currentPage.value, 10)
        return { success: true, message: response.message || 'Curso creado' }
      }
      error.value = response.message || 'Error al crear curso'
      return { success: false, message: response.message || 'Error al crear curso' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear curso'
      return { success: false, message: e.data?.message || 'Error al crear curso' }
    } finally {
      loading.value = false
    }
  }

  const updateCourse = async (id: string, data: UpdateCourseData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Course>>(`/api/cpanel/courses/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchCourses(currentPage.value, 10)
        return { success: true, message: response.message || 'Curso actualizado' }
      }
      error.value = response.message || 'Error al actualizar curso'
      return { success: false, message: response.message || 'Error al actualizar curso' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar curso'
      return { success: false, message: e.data?.message || 'Error al actualizar curso' }
    } finally {
      loading.value = false
    }
  }

  const deleteCourse = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/courses/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchCourses(currentPage.value, 10)
        return { success: true, message: response.message || 'Curso eliminado' }
      }
      error.value = response.message || 'Error al eliminar curso'
      return { success: false, message: response.message || 'Error al eliminar curso' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar curso'
      return { success: false, message: e.data?.message || 'Error al eliminar curso' }
    } finally {
      loading.value = false
    }
  }

  return {
    courses,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchCourses,
    fetchDeletedCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
  }
}
