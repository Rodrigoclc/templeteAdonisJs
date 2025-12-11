// config/mail.ts

import env from '#start/env' // ou 'dotenv' dependendo da sua setup v5/v6
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  // Define a conexão padrão que será usada se nenhuma for especificada
  default: 'smtp',

  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST')!,
      port: env.get('SMTP_PORT'),
      secure: false,

      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME')!,
        pass: env.get('SMTP_PASSWORD')!,
      },

      tls: {},

      ignoreTLS: false,
      requireTLS: false,

      pool: false,
      maxConnections: 5,
      maxMessages: 100,
    }),
  },

  // Configuração para o transporte Resend (se você tiver o pacote extra necessário)
  // Nota: O AdonisJS inclui o driver 'resend' nativamente nas versões mais recentes.
  // resend: transports.resend({
  //   key: env.get('RESEND_API_KEY'),
  //   baseUrl: ''
  // }),

  // Você também pode adicionar um transporte de 'log' para desenvolvimento
  // log: transports.log({
  // Configura para escrever e-mails para o console/logs em vez de enviar
  // logger: console.log,
  // level: 'info'
  // })
})

export default mailConfig

// Necessário para informar o TypeScript sobre os novos mailers definidos (se estiver usando TS)
declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}