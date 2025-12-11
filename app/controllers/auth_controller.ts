import { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '../dto/api_response.js'
import logger from '#services/logger_service'
import { inject } from '@adonisjs/core'
import AuthService from '#services/auth_service'
import {
  changePasswordValidator,
  createUserAsAdminValidator,
  forgotPasswordValidator,
  loginValidator,
  resetPasswordValidator,
  updateUserValidator,
} from '#validators/user'

@inject()
export default class AuthController {
  constructor(protected authService: AuthService) {}

  async login({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const result = await this.authService.login(auth, payload)
    return response.ok(
      new ApiResponse(true, 'Usuário autenticado com sucesso.', {
        token: result.token,
        user: result.user,
      })
    )
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createUserAsAdminValidator)
    const user = await this.authService.store(
      auth.user?.email || null,
      auth.user?.role || null,
      payload
    )
    return response.created(
      new ApiResponse(
        true,
        'Usuário criado com sucesso. Um e-mail de definição de senha foi enviado.',
        user
      )
    )
  }

  async logout({ auth, response }: HttpContext) {
    await this.authService.logout(auth)
    return response.ok(new ApiResponse(true, 'Logout realizado com sucesso.'))
  }

  async profile({ auth, response }: HttpContext) {
    const user = await this.authService.profile(auth)
    return response.ok(new ApiResponse(true, 'Perfil obtido com sucesso.', user))
  }

  async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    await this.authService.forgotPassword(email)
    return response.ok(
      new ApiResponse(true, 'Se o e-mail existir, um link de recuperação foi enviado.')
    )
  }

  async resetPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(resetPasswordValidator)
    await this.authService.resetPassword(payload)
    return response.ok(new ApiResponse(true, 'Senha redefinida com sucesso.'))
  }

  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 10)
    const pagination = await this.authService.index(page, perPage)
    return response.ok(new ApiResponse(true, 'Usuários listados com sucesso.', pagination))
  }

  async destroy({ response, auth, params }: HttpContext) {
    await this.authService.destroy(auth.user?.email || null, auth.user?.role || null, params.id)
    return response.ok(new ApiResponse(true, 'Usuário excluído com sucesso.'))
  }

  async updateStatus({ response, auth, params }: HttpContext) {
    const user = await this.authService.updateStatus(
      auth.user?.email || null,
      auth.user?.role || null,
      params.id
    )
    return response.ok(
      new ApiResponse(true, `Usuário ${user.active ? 'ativado' : 'inativado'} com sucesso.`)
    )
  }

  async update({ request, response, auth, params }: HttpContext) {
    const payload = await request.validateUsing(updateUserValidator)
    const user = await this.authService.update(
      auth.user?.email || null,
      auth.user?.role || null,
      params.id,
      payload
    )
    return response.ok(new ApiResponse(true, 'Usuário atualizado com sucesso.', user))
  }

  async changePassword({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(changePasswordValidator)
    await this.authService.changePassword(auth, payload)
    return response.ok(new ApiResponse(true, 'Senha alterada com sucesso.'))
  }
}
