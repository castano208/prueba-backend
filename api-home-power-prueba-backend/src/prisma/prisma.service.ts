import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Servicio de Prisma que maneja la conexión a la base de datos
 *
 * Este servicio extiende PrismaClient (el cliente generado por Prisma) y se integra
 * con el ciclo de vida de NestJS. Implementa las interfaces OnModuleInit y OnModuleDestroy
 * para gestionar automáticamente las conexiones a la base de datos.
 *
 * PrismaClient es el cliente generado automáticamente por Prisma basado en el schema.prisma
 * y proporciona métodos type-safe para interactuar con la base de datos.
 */
@Injectable() // Decorador que marca esta clase como un servicio inyectable
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // onModuleInit: Se ejecuta cuando NestJS inicializa el módulo
  // Establece la conexión con la base de datos PostgreSQL usando $connect()
  // Esto es importante porque Prisma usa un pool de conexiones para optimizar el rendimiento
  async onModuleInit() {
    await this.$connect();
  }

  // onModuleDestroy: Se ejecuta cuando NestJS destruye el módulo (al cerrar la aplicación)
  // Cierra todas las conexiones a la base de datos usando $disconnect()
  // Esto libera recursos y evita conexiones colgadas
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
