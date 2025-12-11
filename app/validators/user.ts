import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8).confirmed(),
    role: vine.enum(['admin', 'manager', 'operator']),
    active: vine.boolean(),
  })
)

export const createUserAsAdminValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    name: vine.string().trim().minLength(3),
    role: vine.enum(['admin', 'manager', 'operator']),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).optional(),
    email: vine.string().email().normalizeEmail().optional(),
    password: vine.string().minLength(8).confirmed().optional(),
    role: vine.enum(['admin', 'manager', 'operator']).optional(),
    active: vine.boolean().optional(),
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
    password: vine.string().minLength(8).confirmed(),
  })
)

export const changePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string(),
    newPassword: vine.string().minLength(8),
  })
)
