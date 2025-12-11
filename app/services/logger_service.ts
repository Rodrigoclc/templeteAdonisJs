import logger from '@adonisjs/core/services/logger'
import DatabaseLoggerService from './database_logger_service.js'

class LoggerService {
  private dbLogger = new DatabaseLoggerService()

  /**
   * Info level log - also saves to database
   */
  async info(message: string, data?: any, options?: any) {
    logger.info(message, data || {})
    // Save to database asynchronously without blocking
    this.dbLogger.info(message, data, options).catch((err) => {
      logger.debug('Database logger error:', { error: err.message })
    })
  }

  /**
   * Warning level log - also saves to database
   */
  async warn(message: string, data?: any, options?: any) {
    logger.warn(message, data || {})
    // Save to database asynchronously without blocking
    this.dbLogger.warn(message, data, options).catch((err) => {
      logger.debug('Database logger error:', { error: err.message })
    })
  }

  /**
   * Error level log - also saves to database
   */
  async error(message: string, error?: Error | any, options?: any) {
    if (error instanceof Error) {
      logger.error({ message, error: error.message, stack: error.stack })
    } else {
      logger.error(message, error || {})
    }
    // Save to database asynchronously without blocking
    this.dbLogger.error(message, error, options).catch((err) => {
      logger.debug('Database logger error:', { error: err.message })
    })
  }

  /**
   * Debug level log - also saves to database
   */
  async debug(message: string, data?: any, options?: any) {
    logger.debug(message, data || {})
    // Save to database asynchronously without blocking
    this.dbLogger.debug(message, data, options).catch((err) => {
      logger.debug('Database logger error:', { error: err.message })
    })
  }

  /**
   * Direct database access for specific logging scenarios
   */
  getDbLogger() {
    return this.dbLogger
  }
}

export default new LoggerService()
