import { Injectable, OnModuleInit } from '@nestjs/common';
import { getDatabaseConfig, generatePrismaSchema } from './database.config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Servicio para manejar la configuración dinámica de base de datos
 * 
 * Este servicio se encarga de:
 * - Detectar qué base de datos usar basado en variables de entorno
 * - Generar automáticamente el schema de Prisma apropiado
 * - Configurar la URL de conexión correcta
 */
@Injectable()
export class DatabaseService implements OnModuleInit {
  private config = getDatabaseConfig();

  async onModuleInit() {
    console.log('🔧 Configurando base de datos...');
    console.log(`📊 Modo: ${process.env.DB_MODE || 'local'}`);
    console.log(`🗄️  Proveedor: ${this.config.provider}`);
    console.log(`🔗 URL: ${this.config.url.replace(/\/\/.*@/, '//***:***@')}`); // Oculta credenciales
    
    // Configurar la variable de entorno DATABASE_URL para Prisma
    process.env.DATABASE_URL = this.config.url;
    
    console.log('✅ Configuración de base de datos completada');
  }

  /**
   * Genera el archivo schema.prisma basado en la configuración seleccionada
   */
  private async generatePrismaSchema(): Promise<void> {
    try {
      const schemaContent = generatePrismaSchema(this.config);
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      
      // Escribir el nuevo schema
      fs.writeFileSync(schemaPath, schemaContent, 'utf8');
      console.log('📝 Schema de Prisma generado automáticamente');
      
    } catch (error) {
      console.error('❌ Error generando schema de Prisma:', error);
      throw error;
    }
  }

  /**
   * Obtiene la configuración actual de base de datos
   */
  getConfig() {
    return this.config;
  }

  /**
   * Verifica si se está usando base de datos local
   */
  isLocal(): boolean {
    return this.config.provider === 'sqlite';
  }

  /**
   * Verifica si se está usando base de datos remota
   */
  isRemote(): boolean {
    return this.config.provider === 'postgresql';
  }

  /**
   * Obtiene información de la base de datos actual
   */
  getDatabaseInfo() {
    return {
      modo: process.env.DB_MODE || 'local',
      proveedor: this.config.provider,
      esLocal: this.isLocal(),
      esRemota: this.isRemote(),
      url: this.config.url.replace(/\/\/.*@/, '//***:***@'), // Oculta credenciales
      esquemas: this.config.schemas || []
    };
  }
}
