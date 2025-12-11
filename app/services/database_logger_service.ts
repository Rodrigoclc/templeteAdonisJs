import Log from '#models/log'
import type { HttpContext } from '@adonisjs/core/http'

export default class DatabaseLoggerService {
  /**
   * Save log to database
   */
  async save(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    options?: {
      data?: Record<string, any>
      stackTrace?: string
      userId?: bigint
      userEmail?: string
      userRole?: string
      requestMethod?: string
      requestUrl?: string
      responseStatus?: number
      requestId?: string
      resourceType?: string
      resourceId?: bigint
      durationMs?: number
    }
  ) {
    try {
      await Log.create({
        level,
        message,
        data: options?.data,
        stackTrace: options?.stackTrace,
        userId: options?.userId,
        userEmail: options?.userEmail,
        userRole: options?.userRole,
        requestMethod: options?.requestMethod,
        requestUrl: options?.requestUrl,
        responseStatus: options?.responseStatus,
        requestId: options?.requestId,
        resourceType: options?.resourceType,
        resourceId: options?.resourceId,
        durationMs: options?.durationMs,
      })
    } catch (error) {
      // Fallback silencioso para não quebrar a aplicação
      console.error('Failed to save log to database:', error)
    }
  }

  /**
   * Info level log
   */
  async info(
    message: string,
    data?: Record<string, any>,
    options?: Omit<Parameters<this['save']>[2], 'data'>
  ) {
    await this.save('info', message, { data, ...options })
  }

  /**
   * Warning level log
   */
  async warn(
    message: string,
    data?: Record<string, any>,
    options?: Omit<Parameters<this['save']>[2], 'data'>
  ) {
    await this.save('warn', message, { data, ...options })
  }

  /**
   * Error level log
   */
  async error(
    message: string,
    error?: Error | Record<string, any>,
    options?: Omit<Parameters<this['save']>[2], 'stackTrace'>
  ) {
    let errorData = error as Record<string, any>
    let stackTrace: string | undefined

    if (error instanceof Error) {
      errorData = { message: error.message }
      stackTrace = error.stack
    }

    await this.save('error', message, {
      data: errorData,
      stackTrace,
      ...options,
    })
  }

  /**
   * Debug level log
   */
  async debug(
    message: string,
    data?: Record<string, any>,
    options?: Omit<Parameters<this['save']>[2], 'data'>
  ) {
    await this.save('debug', message, { data, ...options })
  }

  /**
   * Extract context from HttpContext
   */
  static extractContext(ctx: HttpContext) {
    return {
      requestMethod: ctx.request.method(),
      requestUrl: ctx.request.url(),
      responseStatus: ctx.response.getStatus(),
      userId: ctx.auth?.user?.id ? BigInt(ctx.auth.user.id) : undefined,
      userEmail: ctx.auth?.user?.email,
      userRole: ctx.auth?.user?.role,
      requestId: ctx.request.id,
    }
  }
}
