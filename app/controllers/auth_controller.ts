import { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '../dto/api_response.js'
import logger from '#services/logger_service'
import { inject } from '@adonisjs/core'
import type { AuthServiceInterface } from '../interfaces/auth_service_interface.js'
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
  constructor(protected authService: AuthServiceInterface) {}

  async login({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(loginValidator)
      const result = await this.authService.login(auth, payload)
      return response.ok(
        new ApiResponse(true, 'Usuário autenticado com sucesso.', {
          token: result.token,
          user: result.user,
        })
      )
    } catch (error) {
      logger.error('Login error', error as Error, { userEmail: request.input('email') })
      return response.unauthorized(new ApiResponse(false, error.message))
    }
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createUserAsAdminValidator)
    try {
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
    } catch (error) {
      logger.error('User creation error', error as Error)
      return response.badRequest(new ApiResponse(false, error.message))
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      await this.authService.logout(auth)
      return response.ok(new ApiResponse(true, 'Logout realizado com sucesso.'))
    } catch (error) {
      logger.error('Logout error', error as Error, {
        userEmail: response.ctx?.auth?.user?.email || null,
        userRole: response.ctx?.auth?.user?.role || null,
      })
      return response.internalServerError(new ApiResponse(false, 'Erro ao realizar logout.'))
    }
  }

  async profile({ auth, response }: HttpContext) {
    try {
      const user = await this.authService.profile(auth)
      return response.ok(new ApiResponse(true, 'Perfil obtido com sucesso.', user))
    } catch (error) {
      return response.unauthorized(new ApiResponse(false, 'Erro ao obter perfil do usuário'))
    }
  }

  async forgotPassword({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(forgotPasswordValidator)
      await this.authService.forgotPassword(email)
      return response.ok(
        new ApiResponse(true, 'Se o e-mail existir, um link de recuperação foi enviado.')
      )
    } catch (error) {
      return response.internalServerError(
        new ApiResponse(false, 'Ocorreu um erro ao processar sua solicitação.')
      )
    }
  }

  async resetPassword({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(resetPasswordValidator)
      await this.authService.resetPassword(payload)
      return response.ok(new ApiResponse(true, 'Senha redefinida com sucesso.'))
    } catch (error) {
      return response.badRequest(new ApiResponse(false, error.message))
    }
  }

  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 10)
      const pagination = await this.authService.index(page, perPage)
      return response.ok(new ApiResponse(true, 'Usuários listados com sucesso.', pagination))
    } catch (error) {
      logger.error('Error listing users', error as Error)
      return response.internalServerError(
        new ApiResponse(false, 'Ocorreu um erro ao listar os usuários.')
      )
    }
  }

  async destroy({ response, auth, params }: HttpContext) {
    try {
      await this.authService.destroy(auth.user?.email || null, auth.user?.role || null, params.id)
      return response.ok(new ApiResponse(true, 'Usuário excluído com sucesso.'))
    } catch (error) {
      logger.error('User deletion error', error as Error)
      return response.internalServerError(new ApiResponse(false, 'Erro ao excluir usuário.'))
    }
  }

  async updateStatus({ response, auth, params }: HttpContext) {
    try {
      const user = await this.authService.updateStatus(
        auth.user?.email || null,
        auth.user?.role || null,
        params.id
      )
      return response.ok(
        new ApiResponse(true, `Usuário ${user.active ? 'ativado' : 'inativado'} com sucesso.`)
      )
    } catch (error) {
      logger.error('User status update error', error as Error)
      return response.internalServerError(
        new ApiResponse(false, 'Erro ao alterar status do usuário.')
      )
    }
  }

  async update({ request, response, auth, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateUserValidator)
      const user = await this.authService.update(
        auth.user?.email || null,
        auth.user?.role || null,
        params.id,
        payload
      )
      return response.ok(new ApiResponse(true, 'Usuário atualizado com sucesso.', user))
    } catch (error) {
      logger.error('User update error', error as Error)
      return response.internalServerError(new ApiResponse(false, 'Erro ao atualizar usuário.'))
    }
  }

  async changePassword({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(changePasswordValidator)
      await this.authService.changePassword(auth, payload)
      return response.ok(new ApiResponse(true, 'Senha alterada com sucesso.'))
    } catch (error) {
      logger.error('Password change error', error as Error)
      return response.badRequest(new ApiResponse(false, error.message))
    }
  }
}
