import type { ApiResponse } from '~/types/api'
import { useBaseCRUD } from './useBaseCRUD'

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

export interface CreateCourseData {
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

export interface UpdateCourseData {
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

const baseCRUD = useBaseCRUD<Course, CreateCourseData, UpdateCourseData>({
  endpoint: '/api/cpanel/courses'
})

export const useCourses = () => {
  return {
    courses: baseCRUD.items,
    loading: baseCRUD.loading,
    error: baseCRUD.error,
    totalElements: baseCRUD.totalElements,
    currentPage: baseCRUD.currentPage,
    totalPages: baseCRUD.totalPages,
    fetchCourses: baseCRUD.fetchAll,
    fetchDeletedCourses: baseCRUD.fetchDeleted,
    getCourse: baseCRUD.getById,
    createCourse: baseCRUD.create,
    updateCourse: baseCRUD.update,
    deleteCourse: baseCRUD.delete
  }
}