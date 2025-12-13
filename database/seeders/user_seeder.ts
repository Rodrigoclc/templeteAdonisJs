import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  /**
   * Cria ou atualiza um usuário administrador padrão com todas as permissões.
   * Nota: senha padrão é definida para ambientes de desenvolvimento.
   */
  public async run() {
    const email = 'admin@email.com'
    const plainPassword = 'admin123'

    // Verifica se o usuário já existe
    let user = await User.findBy('email', email)

    if (!user) {
      user = new User()
      user.name = 'Administrador'
      user.email = email
      user.password = plainPassword
      user.role = 'admin'
      user.active = true
      user.phone = '11999999999'
      user.cpf = '00000000000'
      await user.save()
    } else {
      user.role = 'admin'
      user.active = true
      await user.save()
    }
  }
}