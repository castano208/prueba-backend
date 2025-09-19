import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './config/database.service';

/**
 * Controlador principal de la aplicación
 * Proporciona información sobre el estado de la aplicación y la base de datos
 */
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Endpoint para obtener información sobre la configuración de base de datos
   * Útil para verificar qué base de datos se está usando
   */
  @Get('database-info')
  getDatabaseInfo() {
    return {
      mensaje: 'Información de la base de datos',
      datos: this.databaseService.getDatabaseInfo(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Endpoint para verificar el estado de la aplicación
   */
  @Get('health')
  getHealth() {
    return {
      estado: 'saludable',
      timestamp: new Date().toISOString(),
      baseDatos: this.databaseService.getDatabaseInfo(),
    };
  }
}