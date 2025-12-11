import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import { boasVindas, esqueciSenha } from '../../resources/template.emails.js'
import env from '#start/env'

class EmailService {
  private baseUrlFront = env.get('BASE_URL_FRONT')
  async sendWelcomeEmail(user: User) {
    const token = await this.generatePasswordResetToken(user.email)
    const resetLink = `${this.baseUrlFront}/reset-password?token=${token}` // Replace with your actual reset link

    await mail.send((message) => {
      message.html(boasVindas(user, resetLink))
      message
        .to(user.email)
        .from('noreply@yourapp.com') // Replace with your sending address
        .subject('Bem-vindo à nossa plataforma!')
        .htmlView('emails/welcome', { user, resetLink })
    })
  }

  async sendForgotPasswordEmail(email: string) {
    const token = await this.generatePasswordResetToken(email)
    const resetLink = `${this.baseUrlFront}/reset-password?token=${token}` // Replace with your actual reset link

    await mail.send((message) => {
      message.html(esqueciSenha(resetLink))
      message
        .to(email)
        .from('noreply@yourapp.com') // Replace with your sending address
        .subject('Recuperação de Senha')
    })
  }

  private async generatePasswordResetToken(email: string): Promise<string> {
    const token = randomBytes(20).toString('hex')
    const expiresAt = DateTime.now().plus({ hours: 1 })

    await PasswordResetToken.create({
      email,
      token,
      expiresAt,
    })

    return token
  }
}

export default new EmailService()
