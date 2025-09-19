import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * Servicio de productos que maneja la lógica de negocio
 *
 * Los servicios en NestJS contienen la lógica de negocio y se encargan de interactuar
 * con la base de datos. Este servicio utiliza Prisma como ORM (Object-Relational Mapping)
 * para realizar operaciones CRUD (Create, Read, Update, Delete) en la base de datos PostgreSQL.
 *
 */
@Injectable() // Decorador que marca esta clase como un servicio inyectable
export class ProductsService {
  // Inyección de dependencias: PrismaService se inyecta automáticamente
  constructor(private prisma: PrismaService) {}

  // CREAR: Crear nuevo producto en la base de datos
  // Prisma genera automáticamente el ID UUID y los timestamps (createdAt, updatedAt)
  // El método create() inserta un nuevo registro en la tabla 'producto'
  async crear(dto: CreateProductDto) {
    return this.prisma.producto.create({ data: dto });
  }

  // LEER: Obtener todos los productos sin filtros
  // findMany() retorna todos los registros de la tabla 'producto'
  // Por defecto, Prisma los ordena por fecha de creación (createdAt)
  async buscarTodos() {
    return this.prisma.producto.findMany();
  }

  // LEER: Buscar producto específico por ID
  // findUnique() busca un registro único por su clave primaria (id)
  // Si no encuentra el producto, lanza NotFoundException (error HTTP 404)
  async buscarUno(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  // ACTUALIZAR: Actualizar producto existente
  // Primero valida que el producto existe usando buscarUno()
  // Luego actualiza solo los campos proporcionados en el DTO
  // Prisma actualiza automáticamente el campo updatedAt
  async actualizar(id: string, dto: UpdateProductDto) {
    await this.buscarUno(id); // Validación de existencia
    return this.prisma.producto.update({ where: { id }, data: dto });
  }

  // ELIMINAR: Eliminar producto de la base de datos
  // Valida existencia antes de eliminar para evitar errores silenciosos
  // delete() elimina permanentemente el registro de la base de datos
  async eliminar(id: string) {
    await this.buscarUno(id); // Validación de existencia
    await this.prisma.producto.delete({ where: { id } });
    return { eliminado: true }; // Confirma que la eliminación fue exitosa
  }
}
