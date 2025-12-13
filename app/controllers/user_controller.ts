import { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '../dto/api_response.js'
import { inject } from '@adonisjs/core'
import { createUserValidator, listUsersValidator, updateUserValidator } from '#validators/user'
import logger from '#services/logger_service'
import UserService from '#services/user_service'

@inject()
export default class UserController {
  constructor(protected userService: UserService) {}

  async store({ request, response, auth }: HttpContext) {
    logger.info('Attempt to create user', {
      payload: request.all(),
      admin: auth.user?.email,
    })
    const payload = await request.validateUsing(createUserValidator)
    await this.userService.store(auth.user?.email || null, auth.user?.role || null, payload)
    return response.created(
      new ApiResponse(
        true,
        'Usuário criado com sucesso. Um e-mail de definição de senha foi enviado.'
      )
    )
  }

  async index({ request, response }: HttpContext) {
    const { page = 1, perPage = 10, ...filters } = await request.validateUsing(listUsersValidator)
    const result = await this.userService.index({ page, perPage, ...filters })
    return response.ok(new ApiResponse(true, 'Usuários listados com sucesso.', result))
  }

  async show({ response, params, auth }: HttpContext) {
    const user = await this.userService.show(
      auth.user?.email || null,
      auth.user?.role || null,
      params.id
    )
    return response.ok(new ApiResponse(true, 'Usuário encontrado com sucesso.', user))
  }

  async destroy({ response, auth, params }: HttpContext) {
    await this.userService.destroy(auth.user?.email || null, auth.user?.role || null, params.id)
    return response.ok(new ApiResponse(true, 'Usuário excluído com sucesso.'))
  }

  async updateStatus({ response, auth, params }: HttpContext) {
    const user = await this.userService.updateStatus(
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
    await this.userService.update(
      auth.user?.email || null,
      auth.user?.role || null,
      params.id,
      payload
    )
    return response.ok(new ApiResponse(true, 'Usuário atualizado com sucesso.'))
  }
}
