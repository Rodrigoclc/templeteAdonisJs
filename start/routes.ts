/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    message: 'API is running successfully!',
    status: 'success',
    version: '1.0.0',
    endpoints: {
      users: '/users',
    },
  }
})

router
  .group(() => {
    // Autenticação
    router.post('auth/login', [AuthController, 'login'])
    router.post('auth/forgot-password', [AuthController, 'forgotPassword'])
    router.post('auth/reset-password', [AuthController, 'resetPassword'])
  })
  .prefix('/api/v1')
  .use(middleware.validateException())

  // Rotas protegidas por autenticação
router
  .group(() => {
    // Auth
    router.post('auth/logout', [AuthController, 'logout'])
    router.get('auth/profile', [AuthController, 'profile'])
    router.post('auth/change-password', [AuthController, 'changePassword'])
  })
  .prefix('/api/v1')
  .use([middleware.auth(), middleware.validateException()])