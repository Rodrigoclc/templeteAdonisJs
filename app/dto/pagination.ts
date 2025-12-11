export interface Pagination<T> {
  data: T[]
  pagination: {
    currentPage: number
    itemsPerPage: number
    totalRecords: number
    totalPages: number
  }
}
