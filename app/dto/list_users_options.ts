export interface ListUsersOptions {
  page: number
  perPage: number
  name?: string
  email?: string
  status?: 'active' | 'inactive' | 'all'
}
