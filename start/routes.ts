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
