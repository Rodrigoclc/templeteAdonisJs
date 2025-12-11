import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      
      // Log metadata
      table.enum('level', ['debug', 'info', 'warn', 'error']).notNullable()
      table.string('message', 255).notNullable()
      table.text('data').nullable() // JSON data context
      table.text('stack_trace').nullable() // Stack trace for errors
      
      // User context
      table.bigInteger('user_id').unsigned().nullable()
      table.string('user_email', 255).nullable()
      table.string('user_role', 10).nullable()
      
      // Request context
      table.string('request_method', 10).nullable() // GET, POST, PUT, DELETE, etc
      table.string('request_url', 500).nullable()
      table.integer('response_status').nullable()
      table.string('request_id', 50).nullable() // For distributed tracing
      
      // Resource context
      table.string('resource_type', 50).nullable() // 'vehicle', 'refueling', 'user', etc
      table.bigInteger('resource_id').unsigned().nullable()
      
      // Performance metrics
      table.integer('duration_ms').nullable() // Request duration in milliseconds
      
      // Timestamps
      table
        .timestamp('created_at', { useTz: false })
        .notNullable()
        .defaultTo(this.raw('CURRENT_TIMESTAMP'))
    })

    // Create indexes for common queries
    this.schema.raw('CREATE INDEX idx_logs_level ON logs(level)')
    this.schema.raw('CREATE INDEX idx_logs_user_id ON logs(user_id)')
    this.schema.raw('CREATE INDEX idx_logs_resource ON logs(resource_type, resource_id)')
    this.schema.raw('CREATE INDEX idx_logs_created_at ON logs(created_at DESC)')
    this.schema.raw('CREATE INDEX idx_logs_request_id ON logs(request_id)')
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}