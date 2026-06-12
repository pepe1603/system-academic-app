export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export type ApiResult<T> = ApiResponse<T>

export interface PaginatedData<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
