import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    cpf: vine.string().trim().fixedLength(11),
    role: vine.enum(['admin', 'coordinator', 'operator']),
    email: vine.string().email().normalizeEmail(),
    phone: vine.string().trim().fixedLength(11),
    observations: vine.string().trim().maxLength(500).optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    cpf: vine.string().trim().fixedLength(11),
    role: vine.enum(['admin', 'coordinator', 'operator']),
    email: vine.string().email().normalizeEmail(),
    phone: vine.string().trim().fixedLength(11),
    observations: vine.string().trim().maxLength(500).optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string(),
    // é necesario uma letra maiúscula, um número
    password: vine.string().minLength(6).regex(/^(?=.*[A-Z])(?=.*\d).+$/),
  })
)

export const changePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string(),
    newPassword: vine.string().minLength(8),
  })
)

export const listUsersValidator = vine.compile(
  vine.object({
    page: vine.number().optional(),
    perPage: vine.number().optional(),
    name: vine.string().optional(),
    cpf: vine.string().optional(),
    email: vine.string().optional(),
    status: vine.enum(['active', 'inactive', 'all']).optional(),
  })
)
