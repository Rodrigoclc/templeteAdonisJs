import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Log extends BaseModel {
  @column({ isPrimary: true })
  declare id: bigint

  @column()
  declare level: 'debug' | 'info' | 'warn' | 'error'

  @column()
  declare message: string

  @column()
  declare data?: Record<string, any>

  @column()
  declare stackTrace?: string

  // User context
  @column()
  declare userId?: bigint

  @column()
  declare userEmail?: string

  @column()
  declare userRole?: string

  // Request context
  @column()
  declare requestMethod?: string

  @column()
  declare requestUrl?: string

  @column()
  declare responseStatus?: number

  @column()
  declare requestId?: string

  // Resource context
  @column()
  declare resourceType?: string

  @column()
  declare resourceId?: bigint

  // Performance metrics
  @column()
  declare durationMs?: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
