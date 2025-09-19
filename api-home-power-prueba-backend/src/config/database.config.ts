/**
 * Configuración de bases de datos
 *
 * Este archivo define las configuraciones para diferentes entornos de base de datos.
 * Permite alternar entre base de datos local (SQLite) y remota (PostgreSQL en Render).
 */
export interface DatabaseConfig {
  provider: 'sqlite' | 'postgresql';
  url: string;
  schemas?: string[];
}

/**
 * Configuración para base de datos local (SQLite)
 * Ideal para desarrollo y testing local
 */
export const localDatabaseConfig: DatabaseConfig = {
  provider: 'sqlite',
  url: 'file:./dev.db',
};

/**
 * Configuración para base de datos remota (PostgreSQL en Render)
 * Para producción y desarrollo con datos compartidos
 */
export const remoteDatabaseConfig: DatabaseConfig = {
  provider: 'postgresql',
  url:
    process.env.DATABASE_URL_REMOTE ||
    'postgresql://manejodesechos_user:vWf9D00OGVFCW6wPGrMjvZXrfMBSou5d@dpg-d2lkpa95pdvs73armnpg-a.virginia-postgres.render.com/manejodesechos',
  schemas: ['homePowerPruebaBackend'],
};

/**
 * Obtiene la configuración de base de datos basada en la variable de entorno
 *
 * Variables de entorno:
 * - DB_MODE=local: Usa SQLite local
 * - DB_MODE=remote: Usa PostgreSQL remoto
 * - DB_MODE no definida: Usa local por defecto
 */
export function getDatabaseConfig(): DatabaseConfig {
  const dbMode = process.env.DB_MODE || 'local';

  switch (dbMode.toLowerCase()) {
    case 'remote':
      console.log('🗄️  Usando base de datos remota (PostgreSQL en Render)');
      return remoteDatabaseConfig;
    case 'local':
    default:
      console.log('🗄️  Usando base de datos local (SQLite)');
      return localDatabaseConfig;
  }
}

/**
 * Genera el contenido del schema.prisma basado en la configuración seleccionada
 */
export function generatePrismaSchema(config: DatabaseConfig): string {
  const schemaContent = `// Generador del cliente Prisma para TypeScript
generator client {
  provider = "prisma-client-js"
}

// Configuración de la base de datos ${config.provider.toUpperCase()}
// Generado automáticamente basado en la configuración seleccionada
datasource db {
  provider = "${config.provider}"
  url      = env("DATABASE_URL")
  ${config.schemas ? `schemas  = [${config.schemas.map((s) => `"${s}"`).join(', ')}]` : ''}
}

// Modelo de datos para la entidad Producto
// 
// Los modelos en Prisma definen la estructura de las tablas en la base de datos.
// Cada modelo se convierte en una tabla y cada campo en una columna.
// Prisma genera automáticamente tipos TypeScript basados en estos modelos.
model Producto {
  id        String   @id @default(uuid())  // Clave primaria UUID generada automáticamente
  nombre    String                         // Nombre del producto (campo requerido)
  precio    ${config.provider === 'sqlite' ? 'Float' : 'Decimal  @db.Decimal(10,2)'}     // Precio con 2 decimales máximo
  stock     Int                            // Cantidad en inventario (número entero)
  createdAt DateTime @default(now())       // Timestamp de creación automático
  updatedAt DateTime @updatedAt            // Timestamp de actualización automático

  ${config.schemas ? `@@schema("${config.schemas[0]}")` : ''}       // Especifica el esquema de la base de datos
}`;

  return schemaContent;
}
