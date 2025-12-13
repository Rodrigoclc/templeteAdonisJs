import User from '#models/user'
import { Pagination } from '../dto/pagination.js'
import { inject } from '@adonisjs/core'
import { Infer } from '@vinejs/vine/types'
import { createUserValidator, updateUserValidator } from '#validators/user'
import env from '#start/env'
import loggerService from './logger_service.js'
import EmailService from './email_service.js'
import { UserServiceInterface } from '../interfaces/user_service_interface.js'
import { ListUsersOptions } from '../dto/list_users_options.js'

@inject()
export default class UserService implements UserServiceInterface {
  constructor() {}

  async store(
    userEmail: string | null,
    userRole: string | null,
    payload: Infer<typeof createUserValidator>
  ): Promise<User> {
    loggerService.info(
      'User creation requested',
      { email: payload.email, role: payload.role },
      { userEmail: userEmail, userRole: userRole }
    )

    const existingUser = await User.query()
      .where('email', payload.email)
      .orWhere('cpf', payload.cpf)
      .orWhere('phone', payload.phone)
      .first()
    if (existingUser?.email === payload.email) {
      loggerService.warn(
        'User creation failed: email already exists',
        { email: payload.email },
        { userEmail: userEmail, userRole: userRole }
      )
      throw new Error('O e-mail já está em uso.')
    }
    if (existingUser?.cpf === payload.cpf) {
      loggerService.warn(
        'User creation failed: CPF already exists',
        { cpf: payload.cpf },
        { userEmail: userEmail, userRole: userRole }
      )
      throw new Error('O CPF já está em uso.')
    }
    if (payload.phone && existingUser?.phone === payload.phone) {
      loggerService.warn(
        'User creation failed: phone already exists',
        { phone: payload.phone },
        { userEmail: userEmail, userRole: userRole }
      )
      throw new Error('O telefone já está em uso.')
    }

    const defaultPassword = env.get('DEFAULT_USER_PASSWORD')
    const hashedPassword = defaultPassword

    const user = new User()
    user.fill({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      cpf: payload.cpf,
      phone: payload.phone,
      observations: payload.observations,
      active: true,
    })

    await EmailService.sendWelcomeEmail(user)

    await user.save()

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

    return user
  }

  async index(options: ListUsersOptions): Promise<Pagination<User>> {
    const { page, perPage, name, email, status } = options
    const query = User.query().select('id', 'name', 'email', 'cpf', 'active')

    if (name) {
      query.where('name', 'ilike', `%${name}%`)
    }

    if (email) {
      query.where('email', 'ilike', `%${email}%`)
    }

    if (status && status !== 'all') {
      query.where('active', status === 'active')
    }

    const users = await query.paginate(page, perPage)
    return {
      data: users.all(),
      pagination: {
        currentPage: users.currentPage,
        itemsPerPage: users.perPage,
        totalRecords: users.total,
        totalPages: users.lastPage,
      },
    }
  }

  async destroy(userEmail: string | null, userRole: string | null, userId: string): Promise<void> {
    loggerService.info('User deletion requested', { userId }, { userEmail, userRole })

    const user = await User.findOrFail(userId)

    await user.delete()

    loggerService.info(
      'User deleted successfully',
      { userId, email: user.email },
      { userEmail, userRole }
    )
  }

  async updateStatus(
    userEmail: string | null,
    userRole: string | null,
    userId: string
  ): Promise<User> {
    loggerService.info('User status update requested', { userId }, { userEmail, userRole })

    const user = await User.findOrFail(userId)
    user.active = !user.active
    await user.save()

    loggerService.info(
      'User status updated',
      { userId, active: user.active },
      { userEmail, userRole }
    )
    return user
  }

  async update(
    userEmail: string | null,
    userRole: string | null,
    userId: string,
    payload: Infer<typeof updateUserValidator>
  ): Promise<User> {
    loggerService.info('User update requested', { userId }, { userEmail, userRole })

    const user = await User.findOrFail(userId)
    user.merge(payload)
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

    return user
  }

  async show(userEmail: string | null, userRole: string | null, userId: string): Promise<User> {
    loggerService.info('User fetch requested', { userId }, { userEmail, userRole })

    const user = await User.query()
      .select('id', 'name', 'email', 'cpf', 'phone', 'role', 'observations')
      .where('id', userId)
      .andWhere('is_deleted', false)
      .firstOrFail()

    loggerService.info(
      'User fetched successfully',
      { userId: user.id, email: user.email, name: user.name },
      { userEmail, userRole }
    )

    return user
  }
}
