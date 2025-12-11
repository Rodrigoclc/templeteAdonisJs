import AuthService from '#services/auth_service'
import app from '@adonisjs/core/services/app'

app.container.singleton(AuthService, () => new AuthService())
