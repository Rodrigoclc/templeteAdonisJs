import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // O ID desta tabela (tokens) pode permanecer como incremento (integer),
      // pois ele é apenas uma PK interna para o token, e não a PK do usuário.
      table.increments('id') 
      
      // 🚨 MUDANÇA CRUCIAL AQUI:
      // 1. O tipo deve ser 'uuid', e não 'integer().unsigned()'.
      // 2. Não precisa de 'notNullable()', pois a referência é a que deve garantir a existência.
      table
        .uuid('tokenable_id')
        .notNullable() // Mantenha como notNullable, pois o token pertence a um usuário.
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // ... O restante das colunas permanece o mesmo ...
      table.string('type').notNullable()
      table.string('name').nullable()
      table.string('hash').notNullable()
      table.text('abilities').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('last_used_at').nullable()
      table.timestamp('expires_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}