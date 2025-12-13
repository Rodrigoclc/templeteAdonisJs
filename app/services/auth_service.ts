import User from '#models/user'
import { AuthServiceInterface } from '../interfaces/auth_service_interface.js'
import { inject } from '@adonisjs/core'
import {
  changePasswordValidator,
  loginValidator,
  resetPasswordValidator,
} from '#validators/user'
import { Infer } from '@vinejs/vine/types'
import hash from '@adonisjs/core/services/hash'
import env from '#start/env'
import loggerService from './logger_service.js'
import EmailService from './email_service.js'
import PasswordResetToken from '#models/password_reset_token'
import { DateTime } from 'luxon'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AuthService implements AuthServiceInterface {
  constructor() {}

  async login(
    auth: HttpContext['auth'],
    payload: Infer<typeof loginValidator>
  ): Promise<{ token: any; user: User }> {
    const { email, password } = payload

    loggerService.info('Login attempt', { email }, { userEmail: email })

    if (password === env.get('DEFAULT_USER_PASSWORD')) {
      loggerService.warn('Login failed: default password used', { email }, { userEmail: email })
      throw new Error('Acesse seu email para confirmar conta e alterar a senha')
    }

    const user = await User.findByOrFail('email', email)

    const isValid = await hash.verify(user.password, password)
    if (!isValid) {
      loggerService.warn('Login failed: invalid credentials', { email }, { userEmail: email })
      throw new Error('Credenciais inválidas')
    }

    const token = await auth.use('api').createToken(user, ['*'])
    loggerService.info(
      'Login successful',
      { userId: user.id, email: user.email, role: user.role },
      { userEmail: user.email }
    )
    return { token, user }
  }

  async logout(auth: HttpContext['auth']): Promise<void> {
    const userId = auth.user?.id
    const userEmail = auth.user?.email || null
    const userRole = auth.user?.role || null
    loggerService.info('Logout requested', { userId }, { userEmail, userRole })

    await auth.use('api').invalidateToken()

    loggerService.info('Logout successful', { userId }, { userEmail, userRole })
  }

  async profile(auth: HttpContext['auth']): Promise<User> {
    return auth.user!
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findBy('email', email)

    if (user) {
      await EmailService.sendForgotPasswordEmail(email)
    }
  }

  async resetPassword(payload: Infer<typeof resetPasswordValidator>): Promise<void> {
    const { token, password } = payload

    const tokenRecord = await PasswordResetToken.query().where('token', token).first()

    if (!tokenRecord) {
      throw new Error('Token inválido ou expirado.')
    }

    const isExpired = DateTime.now() > tokenRecord.expiresAt!

    if (isExpired) {
      const user = await User.findBy('email', tokenRecord.email)
      await tokenRecord.delete()
      if (user) {
        await EmailService.sendForgotPasswordEmail(user.email)
      }
      throw new Error('Token expirado. Um novo link de recuperação foi enviado.')
    }

    const user = await User.findByOrFail('email', tokenRecord.email)
    user.password = password
    await user.save()
    await tokenRecord.delete()
  }

  async changePassword(
    auth: HttpContext['auth'],
    payload: Infer<typeof changePasswordValidator>
  ): Promise<void> {
    const userEmail = auth.user?.email || null
    const userRole = auth.user?.role || null
    const { currentPassword, newPassword } = payload
    const user = auth.user!

    loggerService.info(
      'Password change requested',
      { userEmail: user.email },
      { userEmail, userRole }
    )

    const isValid = await hash.verify(user.password, currentPassword)
    if (!isValid) {
      loggerService.warn(
        'Password change failed: invalid current password',
        {
          userEmail: user.email,
        },
        { userEmail, userRole }
      )
      throw new Error('Senha atual inválida.')
    }

    user.password = newPassword
    await user.save()
  }
}
