import User from '#models/user'
import { Pagination } from '../dto/pagination.js'
import { createUserValidator, updateUserValidator } from '#validators/user'
import { Infer } from '@vinejs/vine/types'
import { ListUsersOptions } from '../dto/list_users_options.js'

export interface UserServiceInterface {
  store(
    userEmail: string | null,
    userRole: string | null,
    payload: Infer<typeof createUserValidator>
  ): Promise<User>

  index(options: ListUsersOptions): Promise<Pagination<User>>

  destroy(userEmail: string | null, userRole: string | null, userId: string): Promise<void>

  updateStatus(userEmail: string | null, userRole: string | null, userId: string): Promise<User>

  update(
    userEmail: string | null,
    userRole: string | null,
    userId: string,
    payload: Infer<typeof updateUserValidator>
  ): Promise<User>

  show(userEmail: string | null, userRole: string | null, userId: string): Promise<User>
}
