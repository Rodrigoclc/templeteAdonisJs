import { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '../dto/api_response.js'
import { inject } from '@adonisjs/core'
import AuthService from '#services/auth_service'
import {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  resetPasswordValidator,
} from '#validators/user'
import logger from '#services/logger_service'
import env from '#start/env'

@inject()
export default class AuthController {
  constructor(protected authService: AuthService) {}

  async login({ request, response, auth }: HttpContext) {
    logger.info('Login attempt', { email: request.input('email') })
    const payload = await request.validateUsing(loginValidator)
    // Ensure the provided password is not equal to the default password
    const defaultPassword = env.get('DEFAULT_USER_PASSWORD')
    console.log("DEFAULT_USER_PASSWORD",defaultPassword)
    if (defaultPassword && payload.password === defaultPassword) {
      const err: any = new Error('Falha na validação')
      err.code = 'E_VALIDATION_ERROR'
      err.errors = [
        {
          field: 'password',
          rule: 'notEqualsDefault',
          message: 'Verifique seu email e troque a senha padrão antes de continuar.',
        },
      ]
      throw err
    }
    const result = await this.authService.login(auth, payload)
    return response.ok(
      new ApiResponse(true, 'Usuário autenticado com sucesso.', {
        token: result.token,
        user: result.user,
      })
    )
  }

  async logout({ auth, response }: HttpContext) {
    logger.info('User logout', { user: auth.user?.email })
    await this.authService.logout(auth)
    return response.ok(new ApiResponse(true, 'Logout realizado com sucesso.'))
  }

  async profile({ auth, response }: HttpContext) {
    const user = await this.authService.profile(auth)
    return response.ok(new ApiResponse(true, 'Perfil obtido com sucesso.', user))
  }

  async forgotPassword({ request, response }: HttpContext) {
    logger.info('Forgot password request', { email: request.input('email') })
    const { email } = await request.validateUsing(forgotPasswordValidator)
    await this.authService.forgotPassword(email)
    return response.ok(
      new ApiResponse(true, 'Se o e-mail existir, um link de recuperação foi enviado.')
    )
  }

  async resetPassword({ request, response }: HttpContext) {
    logger.info('Reset password attempt', { email: request.input('email') })
    const payload = await request.validateUsing(resetPasswordValidator)
    await this.authService.resetPassword(payload)
    return response.ok(new ApiResponse(true, 'Senha redefinida com sucesso.'))
  }

  async changePassword({ request, response, auth }: HttpContext) {
    logger.info('Change password attempt', { user: auth.user?.email })
    const payload = await request.validateUsing(changePasswordValidator)
    await this.authService.changePassword(auth, payload)
    return response.ok(new ApiResponse(true, 'Senha alterada com sucesso.'))
  }
}
