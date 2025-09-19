# Documentación de Desarrollo

## Conceptos Técnicos Principales

### NestJS Framework
NestJS es un framework de Node.js que utiliza:
- **Decoradores**: Para definir controladores, servicios, pipes, etc.
- **Inyección de Dependencias**: Para gestionar automáticamente las dependencias
- **Módulos**: Para organizar la aplicación en bloques funcionales
- **Pipes**: Para transformar y validar datos antes de llegar al controlador
- **Filtros**: Para manejar excepciones de forma centralizada
- **Guards**: Para autenticación y autorización

### Patrón MVC (Model-View-Controller)
- **Model**: Representado por Prisma (esquema de base de datos)
- **View**: Respuestas JSON de la API
- **Controller**: Maneja requests HTTP y delega lógica al servicio
- **Service**: Contiene la lógica de negocio

### ORM (Object-Relational Mapping)
Prisma actúa como ORM y proporciona:
- **Type Safety**: Tipos TypeScript generados automáticamente
- **Query Builder**: API fluida para construir consultas
- **Migraciones**: Gestión automática de cambios en la base de datos
- **Client Generation**: Cliente optimizado para cada base de datos

## Paquetes Principales y su Propósito

### Framework y Core
- **@nestjs/core**: Framework principal de NestJS para aplicaciones Node.js escalables
- **@nestjs/common**: Utilidades comunes como decoradores (@Injectable, @Controller), pipes, filtros y excepciones
- **@nestjs/platform-express**: Adaptador para Express.js (servidor HTTP subyacente)
- **@nestjs/config**: Módulo para manejo de variables de entorno y configuración centralizada
- **@nestjs/mapped-types**: Utilidades para crear DTOs derivados (PartialType, PickType, etc.)

### Base de Datos y ORM
- **@prisma/client**: Cliente generado por Prisma para interactuar con la base de datos de forma type-safe
- **prisma**: CLI de Prisma para migraciones, generación de cliente y gestión de esquemas
- **class-validator**: Decoradores para validación automática de DTOs (@IsString, @IsNumber, etc.)
- **class-transformer**: Transformación de objetos y tipos de datos (plainToClass, classToPlain)

### Testing
- **@nestjs/testing**: Utilidades de testing específicas para NestJS (TestingModule, createTestingModule)
- **jest**: Framework de testing con mocks, assertions y cobertura de código
- **@types/jest**: Tipos TypeScript para Jest (expect, describe, it, beforeEach, etc.)

### Desarrollo y Build
- **typescript**: Compilador de TypeScript que convierte TS a JavaScript
- **ts-node**: Ejecutor de TypeScript para desarrollo (sin compilar)
- **ts-jest**: Preset de Jest para TypeScript (transforma archivos TS durante testing)

## Configuración para Base de Datos Local

### Opción 1: PostgreSQL Local

1. **Instalar PostgreSQL localmente**
2. **Crear base de datos**:
   ```sql
   CREATE DATABASE homepower_local;
   ```
3. **Modificar archivo .env**:
   ```
   DATABASE_URL="postgresql://usuario:password@localhost:5432/homepower_local"
   ```
4. **Actualizar schema.prisma** (opcional, para esquema específico):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     schemas  = ["public"]  // Cambiar a "public" o eliminar esta línea
   }
   
   model Producto {
     // ... campos del modelo
     @@schema("public")  // Cambiar a "public" o eliminar esta línea
   }
   ```

### Opción 2: SQLite Local

1. **Modificar archivo .env**:
   ```
   DATABASE_URL="file:./dev.db"
   ```
2. **Actualizar schema.prisma**:
   ```prisma
   datasource db {
     provider = "sqlite"  // Cambiar de "postgresql" a "sqlite"
     url      = env("DATABASE_URL")
     // Eliminar la línea schemas
   }
   
   model Producto {
     id        String   @id @default(uuid())
     nombre    String
     precio    Float    // Cambiar de Decimal a Float para SQLite
     stock     Int
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     // Eliminar la línea @@schema
   }
   ```

### Comandos para Aplicar Cambios

Después de modificar la configuración:

```bash
# Regenerar cliente de Prisma
npx prisma generate

# Aplicar esquema a la base de datos
npx prisma db push

# Reiniciar servidor
npm run start:dev
```

## Estructura de Archivos

```
src/
├── common/
│   └── filters/
│       └── http-exception.filter.ts  # Filtro global de excepciones
├── products/
│   ├── dto/
│   │   ├── create-product.dto.ts     # DTO para crear productos
│   │   └── update-product.dto.ts     # DTO para actualizar productos
│   ├── products.controller.ts        # Controlador REST
│   ├── products.service.ts           # Lógica de negocio
│   └── products.module.ts            # Módulo de productos
├── prisma/
│   └── prisma.service.ts             # Servicio de conexión a BD
├── app.module.ts                     # Módulo principal
├── app.controller.ts                 # Controlador principal
├── app.service.ts                    # Servicio principal
└── main.ts                           # Punto de entrada

test/
└── products.service.spec.ts          # Pruebas unitarias

prisma/
└── schema.prisma                     # Esquema de base de datos
```

## Flujo de Datos Detallado

1. **Request HTTP** → Llega al servidor Express (manejado por NestJS)
2. **Routing** → NestJS determina qué controlador maneja la ruta
3. **Pipes** → ValidationPipe valida y transforma los datos del DTO
4. **Controller** → Recibe datos validados y delega al servicio
5. **Service** → Ejecuta lógica de negocio y valida reglas
6. **PrismaService** → Convierte operaciones a consultas SQL
7. **Base de Datos** → Ejecuta consultas y retorna resultados
8. **Response** → Datos se serializan a JSON y se envían al cliente

## Validaciones Implementadas

### CreateProductDto
- **nombre**: 
  - @IsString(): Debe ser string
  - @IsNotEmpty(): No puede estar vacío
- **precio**: 
  - @IsNumber({ maxDecimalPlaces: 2 }): Número con máximo 2 decimales
  - @Min(0): Valor mínimo 0 (no negativos)
- **stock**: 
  - @IsInt(): Debe ser entero
  - @Min(0): Valor mínimo 0 (no negativo)

### UpdateProductDto
- Hereda todas las validaciones de CreateProductDto
- Todos los campos son opcionales (PartialType)
- Permite actualizaciones parciales

## Manejo de Errores

### Tipos de Errores
- **NotFoundException**: Error HTTP 404 cuando un producto no existe
- **ValidationPipe**: Error HTTP 400 cuando los datos no pasan validación
- **HttpExceptionFilter**: Intercepta y estandariza todas las respuestas de error

### Estructura de Error
```json
{
  "codigoEstado": 404,
  "marcaTiempo": "2025-09-19T20:30:00.000Z",
  "ruta": "/products/123",
  "metodo": "GET",
  "mensaje": "Producto no encontrado"
}
```

## Testing

### Estrategia de Testing
- **Unit Tests**: Prueban servicios de forma aislada usando mocks
- **Integration Tests**: Prueban la integración entre componentes
- **E2E Tests**: Prueban la aplicación completa

### Mocks Utilizados
- **PrismaService**: Simula operaciones de base de datos
- **jest.fn()**: Crea funciones mock espiables
- **mockResolvedValue()**: Simula Promises resueltas
- **TestingModule**: Configura el módulo de testing de NestJS

## Conceptos de Decoradores

### Decoradores de NestJS
- **@Controller()**: Define una clase como controlador REST
- **@Injectable()**: Marca una clase como inyectable (servicio)
- **@Get()**, **@Post()**, **@Put()**, **@Delete()**: Define métodos HTTP
- **@Body()**: Extrae datos del cuerpo de la request
- **@Param()**: Extrae parámetros de la URL
- **@Catch()**: Define qué excepciones captura un filtro

### Decoradores de Validación
- **@IsString()**: Valida que sea string
- **@IsNumber()**: Valida que sea número
- **@IsInt()**: Valida que sea entero
- **@IsNotEmpty()**: Valida que no esté vacío
- **@Min()**: Valida valor mínimo
