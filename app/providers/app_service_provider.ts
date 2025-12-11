import { ApplicationService } from '@adonisjs/core/types'

export default class AppServiceProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    // Bindings are registered in config/app.ts and start/bindings.ts
  }
}
