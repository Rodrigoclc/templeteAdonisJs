import User from '#models/user'
import {
  changePasswordValidator,
  loginValidator,
  resetPasswordValidator,
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

  logout(auth: HttpContext['auth']): Promise<void>

  profile(auth: HttpContext['auth']): Promise<User>

  forgotPassword(email: string): Promise<void>

  resetPassword(payload: Infer<typeof resetPasswordValidator>): Promise<void>

  changePassword(
    auth: HttpContext['auth'],
    payload: Infer<typeof changePasswordValidator>
  ): Promise<void>
}
