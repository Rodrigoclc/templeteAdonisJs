import User from '#models/user'

export const boasVindas = (user: User, resetLink: string): string => {
  return `
    <!DOCTYPE html>
        <html>
        <head>
          <title>Bem-vindo!</title>
        </head>
        <body>
          <h1>Bem-vindo, ${user.name}!</h1>
          <p>Obrigado por se cadastrar em nossa plataforma.</p>
          <p>Para definir sua senha, por favor, clique no link abaixo:</p>
          <a href="${resetLink}">Definir Senha</a>
        </body>
        </html>
    `
}

export const esqueciSenha = (resetLink: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recuperação de Senha</title>
    </head>
    <body>
      <h1>Recuperação de Senha</h1>
      <p>Você solicitou a recuperação de senha. Clique no link abaixo para criar uma nova senha:</p>
      <a href="${resetLink}">Criar Nova Senha</a>
    </body>
    </html>
    `
}
