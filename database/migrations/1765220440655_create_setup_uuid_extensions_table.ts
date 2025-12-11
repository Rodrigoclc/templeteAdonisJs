import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  // Não precisamos de um nome de tabela específico, pois o comando é RAW

  public async up() {
    // Comando RAW para criar a extensão 'uuid-ossp' se ela ainda não existir.
    // Esta extensão é necessária para usar funções como 'uuid_generate_v4()'.
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  }

  public async down() {
    // Comando RAW para remover a extensão ao reverter a migração.
    this.schema.raw('DROP EXTENSION IF EXISTS "uuid-ossp"')
  }
}
