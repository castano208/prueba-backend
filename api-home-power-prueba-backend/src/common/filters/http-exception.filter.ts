import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones HTTP
 */
@Catch(HttpException) // Decorador que especifica qué tipo de excepciones captura este filtro
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // ArgumentsHost es una clase que proporciona acceso al contexto de la request
    // Puede ser HTTP, GraphQL, WebSocket, etc. Aquí usamos switchToHttp() para HTTP
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>(); // Objeto Response de Express
    const request = ctx.getRequest<Request>(); // Objeto Request de Express
    const status = exception.getStatus(); // Código de estado HTTP (400, 404, 500, etc.)

    const respuestaError = {
      codigoEstado: status,
      marcaTiempo: new Date().toISOString(),
      ruta: request.url,
      metodo: request.method,
      mensaje: exception.message || 'Error interno del servidor',
    };

    // Envía la respuesta JSON con el código de estado apropiado
    response.status(status).json(respuestaError);
  }
}
