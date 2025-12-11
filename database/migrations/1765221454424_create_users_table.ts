import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.string('name', 255).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 255).notNullable()
      table.string('role', 10).notNullable().checkIn(['admin', 'manager', 'operator'])
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamp('last_login', { useTz: false })

      table
        .timestamp('created_at', { useTz: false })
        .notNullable()
        .defaultTo(this.raw('CURRENT_TIMESTAMP'))
      table
        .timestamp('updated_at', { useTz: false })
        .notNullable()
        .defaultTo(this.raw('CURRENT_TIMESTAMP'))
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}