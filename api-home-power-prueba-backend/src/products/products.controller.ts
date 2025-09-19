import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * Controlador REST para operaciones CRUD de productos
 * Los controladores en NestJS manejan las requests HTTP entrantes y devuelven respuestas.
 * Utilizan decoradores para definir rutas, métodos HTTP y extraer datos de la request.
 * Este controlador implementa el patrón REST para la entidad Producto.
 */
@Controller('products') // Decorador que define la ruta base '/products' para todos los endpoints
export class ProductsController {
  // Inyección de dependencias: NestJS inyecta automáticamente ProductsService
  constructor(private readonly productsService: ProductsService) {}

  // Endpoint POST /products: Crear nuevo producto
  // @Body() extrae automáticamente el JSON del cuerpo de la request
  // CreateProductDto valida que los datos cumplan con las reglas de negocio
  @Post()
  crear(@Body() dto: CreateProductDto) {
    return this.productsService.crear(dto);
  }

  // Endpoint GET /products: Obtener todos los productos
  // No requiere parámetros, retorna lista completa de productos
  @Get()
  buscarTodos() {
    return this.productsService.buscarTodos();
  }

  // Endpoint GET /products/:id: Obtener producto específico por ID
  // @Param('id') extrae el parámetro 'id' de la URL (ej: /products/123)
  @Get(':id')
  buscarUno(@Param('id') id: string) {
    return this.productsService.buscarUno(id);
  }

  // Endpoint PUT /products/:id: Actualizar producto existente
  // Combina ID de la URL con datos del body para actualización parcial
  // UpdateProductDto permite actualizar solo algunos campos
  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.actualizar(id, dto);
  }

  // Endpoint DELETE /products/:id: Eliminar producto por ID
  // Realiza validación de existencia antes de eliminar para evitar errores
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.productsService.eliminar(id);
  }
}
