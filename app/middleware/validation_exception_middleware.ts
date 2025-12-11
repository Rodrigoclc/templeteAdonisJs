import { HttpContext } from '@adonisjs/core/http'

/**
 * Validation exception middleware
 * Note: Validation errors are now handled by the exception handler
 */
export default class ValidationExceptionMiddleware {
  async handle(_ctx: HttpContext, next: () => Promise<void>) {
    await next()
  }
}




