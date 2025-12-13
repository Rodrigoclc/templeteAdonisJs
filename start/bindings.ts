import AuthService from '#services/auth_service'
import UserService from '#services/user_service'
import app from '@adonisjs/core/services/app'

app.container.singleton(AuthService, () => new AuthService())
app.container.singleton(UserService, () => new UserService())
