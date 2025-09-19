import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Punto de entrada principal de la aplicación NestJS
 *
 * NestJS es un framework de Node.js que utiliza decoradores y inyección de dependencias
 * para crear aplicaciones escalables y mantenibles. Este archivo configura la aplicación
 * con pipes globales y filtros de excepción que se aplican a todas las rutas.
 */
async function bootstrap() {
  // NestFactory es la clase principal que crea instancias de aplicaciones NestJS
  // AppModule es el módulo raíz que contiene toda la configuración de la aplicación
  const app = await NestFactory.create(AppModule);

  // ValidationPipe es un pipe que valida automáticamente todos los DTOs (Data Transfer Objects)
  // usando la librería class-validator. Se ejecuta antes de que llegue al controlador.
  //
  // Opciones del ValidationPipe:
  // - whitelist: true - elimina propiedades no definidas en el DTO (seguridad)
  // - transform: true - convierte tipos automáticamente (string a number, etc.)
  // - forbidNonWhitelisted: true - rechaza requests con propiedades no permitidas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // HttpExceptionFilter es un filtro que intercepta todas las excepciones HTTP
  // y las convierte en respuestas JSON estandarizadas. Esto evita que se expongan
  // detalles internos del servidor y proporciona una API consistente.
  app.useGlobalFilters(new HttpExceptionFilter());

  // Inicia el servidor HTTP en el puerto especificado en la variable de entorno PORT
  // Si no está definida, usa el puerto 3000 por defecto
  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
