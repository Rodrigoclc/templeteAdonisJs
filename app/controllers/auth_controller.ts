import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import { ApiResponse } from '../dto/api_response.js'
import EmailService from '#services/email_service'
import PasswordResetToken from '#models/password_reset_token'
import { DateTime } from 'luxon'
import env from '#start/env'
import { createUserAsAdminValidator, updateUserValidator } from '#validators/user'
import { Pagination } from '../dto/pagination.js'
import loggerService from '#services/logger_service'

export default class AuthController {
  async login({ request, response, auth }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      loggerService.info('Login attempt', { email }, { userEmail: email })

      if (password === env.get('DEFAULT_USER_PASSWORD')) {
        loggerService.warn('Login failed: default password used', { email }, { userEmail: email })
        return response.badRequest(
          new ApiResponse(false, 'Acesse seu email para confirmar conta e alterar a senha')
        )
      }

      const user = await User.findByOrFail('email', email)

      // Verificar senha
      const isValid = await hash.verify(user.password, password)
      if (!isValid) {
        loggerService.warn('Login failed: invalid credentials', { email }, { userEmail: email })
        return response.unauthorized(new ApiResponse(false, 'Credenciais inválidas'))
      }

      const token = await auth.use('api').createToken(user, ['*'])
      loggerService.info(
        'Login successful',
        { userId: user.id, email: user.email, role: user.role },
        { userEmail: user.email }
      )
      return response.ok(
        new ApiResponse(true, 'Usuário autenticado com sucesso.', {
          token: token,
          user,
        })
      )
    } catch (error) {
      loggerService.error('Login error', error as Error, { userEmail: request.input('email') })
      return response.unauthorized(new ApiResponse(false, 'Credenciais inválidas'))
    }
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserAsAdminValidator)
    const userEmail = response.ctx?.auth?.user?.email || null
    const userRole = response.ctx?.auth?.user?.role || null

    loggerService.info(
      'User creation requested',
      { email: payload.email, role: payload.role },
      { userEmail: userEmail, userRole: userRole }
    )

    const existingUser = await User.findBy('email', payload.email)
    if (existingUser) {
      loggerService.warn(
        'User creation failed: email already exists',
        { email: payload.email },
        { userEmail: userEmail, userRole: userRole }
      )
      return response.badRequest(new ApiResponse(false, 'O e-mail já está em uso.'))
    }

    const defaultPassword = env.get('DEFAULT_USER_PASSWORD')
    const hashedPassword = defaultPassword

    const user = new User()
    user.fill({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
    })

    await user.save()

    await EmailService.sendWelcomeEmail(user)

    loggerService.info(
      'User created successfully',
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      { userEmail: userEmail, userRole: userRole }
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
    try {
      const userId = auth.user?.id
      const userEmail = response.ctx?.auth?.user?.email || null
      const userRole = response.ctx?.auth?.user?.role || null
      loggerService.info('Logout requested', { userId }, { userEmail, userRole })

      await auth.use('api').invalidateToken()

      loggerService.info('Logout successful', { userId }, { userEmail, userRole })
      return response.ok(new ApiResponse(true, 'Logout realizado com sucesso.'))
    } catch (error) {
      loggerService.error('Logout error', error as Error, {
        userEmail: response.ctx?.auth?.user?.email || null,
        userRole: response.ctx?.auth?.user?.role || null,
      })
      return response.internalServerError(new ApiResponse(false, 'Erro ao realizar logout.'))
    }
  }

  async profile({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      if (user) return response.ok(new ApiResponse(true, 'Perfi obtido com sucesso.', user))
    } catch (error) {
      return response.unauthorized(new ApiResponse(false, 'Erro ao obter perfil do usuário'))
    }
  }

  async forgotPassword({ request, response }: HttpContext) {
    const { email } = request.only(['email'])
    try {
      const user = await User.findBy('email', email)

      if (user) {
        await EmailService.sendForgotPasswordEmail(email)
      }

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
    const { token, password } = request.only(['token', 'password'])

    try {
      const tokenRecord = await PasswordResetToken.query().where('token', token).first()

      if (!tokenRecord) {
        return response.badRequest(new ApiResponse(false, 'Token inválido ou expirado.'))
      }

      const isExpired = DateTime.now() > tokenRecord.expiresAt!

      if (isExpired) {
        const user = await User.findBy('email', tokenRecord.email)

        await tokenRecord.delete()

        if (user) {
          await EmailService.sendForgotPasswordEmail(user.email)
        }

        return response.badRequest(
          new ApiResponse(false, 'Token expirado. Um novo link de recuperação foi enviado.')
        )
      }

      const user = await User.findByOrFail('email', tokenRecord.email)

      user.password = password
      await user.save()

      await tokenRecord.delete()

      return response.ok(new ApiResponse(true, 'Senha redefinida com sucesso.'))
    } catch (error) {
      return response.badRequest(new ApiResponse(false, 'Erro ao redefinir a senha.'))
    }
  }

  async index({ request, response }: HttpContext) {
    const { page = 1, perPage = 10 } = request.qs()
    const users = await User.query()
      .paginate(page, perPage)
    const pagination: Pagination<User> = {
      data: users.all(),
      pagination: {
        currentPage: users.currentPage,
        itemsPerPage: users.perPage,
        totalRecords: users.total,
        totalPages: users.lastPage,
      },
    }
    return response.ok(new ApiResponse(true, 'Usuários listados com sucesso.', pagination))
  }

  async destroy({ params, response }: HttpContext) {
    const userEmail = response.ctx?.auth?.user?.email || null
    const userRole = response.ctx?.auth?.user?.role || null
    try {
      const userId = params.id

      loggerService.info('User deletion requested', { userId }, { userEmail, userRole })

      const user = await User.findOrFail(userId)

      await user.delete()

      loggerService.info(
        'User deleted successfully',
        { userId, email: user.email },
        { userEmail, userRole }
      )
      return response.ok(new ApiResponse(true, 'Usuário excluído com sucesso.'))
    } catch (error) {
      loggerService.error('User deletion error', error as Error, { userEmail, userRole })
      return response.internalServerError(new ApiResponse(false, 'Erro ao excluir usuário.'))
    }
  }

  async updateStatus({ params, response }: HttpContext) {
    const userEmail = response.ctx?.auth?.user?.email || null
    const userRole = response.ctx?.auth?.user?.role || null
    try {
      const userId = params.id
      loggerService.info('User status update requested', { userId }, { userEmail, userRole })

      const user = await User.findOrFail(userId)

      user.active = !user.active
      await user.save()

      loggerService.info(
        'User status updated',
        { userId, active: user.active },
        { userEmail, userRole }
      )
      return response.ok(
        new ApiResponse(true, `Usuário ${user.active ? 'ativado' : 'inativado'} com sucesso.`)
      )
    } catch (error) {
      loggerService.error('User status update error', error as Error, { userEmail, userRole })
      return response.internalServerError(
        new ApiResponse(false, 'Erro ao alterar status do usuário.')
      )
    }
  }

  async update({ params, request, response }: HttpContext) {
    const userEmail = response.ctx?.auth?.user?.email || null
    const userRole = response.ctx?.auth?.user?.role || null
    try {
      const userId = params.id

      loggerService.info('User update requested', { userId }, { userEmail, userRole })

      const user = await User.findOrFail(userId)
      const payload = await request.validateUsing(updateUserValidator)

      const restOfPayload = payload

      user.merge(restOfPayload)

      await user.save()

      loggerService.info(
        'User updated successfully',
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        { userEmail, userRole }
      )

      return response.ok(new ApiResponse(true, 'Usuário atualizado com sucesso.', user))
    } catch (error) {
      loggerService.error('User update error', error as Error, { userEmail, userRole })
      return response.internalServerError(new ApiResponse(false, 'Erro ao atualizar usuário.'))
    }
  }

  async changePassword({ request, response, auth }: HttpContext) {
    const userEmail = response.ctx?.auth?.user?.email || null
    const userRole = response.ctx?.auth?.user?.role || null
    const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])
    const user = auth.user!
    loggerService.info('Password change requested', { userEmail: user.email }, { userEmail, userRole })

    const isValid = await hash.verify(user.password, currentPassword)
    if (!isValid) {
      loggerService.warn('Password change failed: invalid current password', {
        userEmail: user.email,
      }, { userEmail, userRole })
      return response.badRequest(new ApiResponse(false, 'Senha atual inválida.'))
    }

    user.password = newPassword
    await user.save()

    return response.ok(new ApiResponse(true, 'Senha alterada com sucesso.'))
  }
}
