import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { ApiResponse } from '#dto/api_response'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Handle Vine validation errors
    if (
      error instanceof Error &&
      (error as any).code === 'E_VALIDATION_ERROR'
    ) {
      const errorObj = error as any
      // Transform Vine error objects into user friendly Portuguese messages
      const errorMessages = this.extractErrorMessages(errorObj.errors || errorObj.messages || [])
      return ctx.response.status(422).send(
        new ApiResponse(
          false,
          'Validation failed',
          undefined,
          errorMessages
        )
      )
    }

    return super.handle(error, ctx)
  }

  /**
   * Extract error messages from Vine validation errors
   */
  private extractErrorMessages(errors: any): string[] {
    if (!Array.isArray(errors)) {
      return []
    }

    const fieldNames: Record<string, string> = {
      email: 'e-mail',
      password: 'senha',
      currentPassword: 'senha atual',
      newPassword: 'nova senha',
      name: 'nome',
      role: 'função',
      token: 'token',
    }

    return errors
      .map((err: any) => {
        // err expected shape: { message, rule, field }
        const rule = err.rule
        const field = err.field || err.key || ''
        const prettyField = fieldNames[field] || this.humanizeField(field)

        switch (rule) {
          case 'required':
            return `O campo ${prettyField} é obrigatório`
          case 'email':
            return `O campo ${prettyField} deve ser um e-mail válido`
          case 'minLength': {
            // attempt to extract number from original message
            const m = String(err.message).match(/\d+/)
            const min = m ? m[0] : 'o valor mínimo'
            return `O campo ${prettyField} deve ter pelo menos ${min} caracteres`
          }
          case 'confirmed':
            return `A confirmação de ${prettyField} não confere`
          case 'enum':
            return `O campo ${prettyField} possui um valor inválido`
          default:
            // fallback to original message if available
            return typeof err.message === 'string' ? err.message : `Erro no campo ${prettyField}`
        }
      })
      .filter((m: any) => typeof m === 'string')
  }

  /**
   * Convert camelCase or snake_case field into human readable Portuguese-ish text
   */
  private humanizeField(field: string): string {
    if (!field) return field
    // split camelCase and snake_case
    const parts = field
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[-\.]/g, '_')
      .split('_')
      .filter(Boolean)
      .map((p) => p.toLowerCase())
    return parts.join(' ')
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
