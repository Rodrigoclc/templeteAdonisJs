import User from '#models/user'
import { Pagination } from '../dto/pagination.js'
import {
  changePasswordValidator,
  createUserAsAdminValidator,
  loginValidator,
  resetPasswordValidator,
  updateUserValidator,
} from '#validators/user'
import { Infer } from '@vinejs/vine/types'
import { HttpContext } from '@adonisjs/core/http'

export interface AuthServiceInterface {
  login(
    auth: HttpContext['auth'],
    payload: Infer<typeof loginValidator>
  ): Promise<{
    token: any
    user: User
  }>

  store(
    userEmail: string | null,
    userRole: string | null,
    payload: Infer<typeof createUserAsAdminValidator>
  ): Promise<User>

  logout(auth: HttpContext['auth']): Promise<void>

  profile(auth: HttpContext['auth']): Promise<User>

  forgotPassword(email: string): Promise<void>

  resetPassword(payload: Infer<typeof resetPasswordValidator>): Promise<void>

  index(page: number, perPage: number): Promise<Pagination<User>>

  destroy(userEmail: string | null, userRole: string | null, userId: string): Promise<void>

  updateStatus(userEmail: string | null, userRole: string | null, userId: string): Promise<User>

  update(
    userEmail: string | null,
    userRole: string | null,
    userId: string,
    payload: Infer<typeof updateUserValidator>
  ): Promise<User>

  changePassword(
    auth: HttpContext['auth'],
    payload: Infer<typeof changePasswordValidator>
  ): Promise<void>
}
