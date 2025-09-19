import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from '../src/products/products.service';
import { CreateProductDto } from '../src/products/dto/create-product.dto';
import { UpdateProductDto } from '../src/products/dto/update-product.dto';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Pruebas unitarias para ProductsService
 *
 * Estas pruebas cubren todos los métodos CRUD y casos de error del servicio,
 * utilizando mocks de Prisma para aislar la lógica de negocio de la base de datos.
 */

// Objeto mock que simula un producto para las pruebas
// Representa la estructura de datos que retorna Prisma
const productoMock = {
  id: 'uuid',
  nombre: 'Prueba',
  precio: 10.0,
  stock: 5,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date(),
};

// Mock de PrismaService que simula las operaciones de base de datos
//
// jest.fn() crea funciones mock que pueden ser espiadas y controladas
// mockResolvedValue() hace que la función mock retorne una Promise resuelta
// Esto permite probar la lógica de negocio sin conectar a una base de datos real
const prismaMock = {
  producto: {
    create: jest.fn().mockResolvedValue(productoMock), // Simula creación exitosa
    findMany: jest.fn().mockResolvedValue([productoMock]), // Simula búsqueda de múltiples registros
    findUnique: jest.fn().mockResolvedValue(productoMock), // Simula búsqueda de un registro
    update: jest.fn().mockResolvedValue(productoMock), // Simula actualización exitosa
    delete: jest.fn().mockResolvedValue({}), // Simula eliminación exitosa
  },
};

describe('ServicioProductos', () => {
  let servicio: ProductsService;

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    servicio = modulo.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('deberia crear un producto', async () => {
      const dtoCrearProducto: CreateProductDto = { nombre: 'Prueba', precio: 10, stock: 1 };
      const resultado = await servicio.crear(dtoCrearProducto);

      expect(prismaMock.producto.create).toHaveBeenCalledWith({ data: dtoCrearProducto });
      expect(resultado).toEqual(productoMock);
    });
  });

  describe('buscarTodos', () => {
    it('deberia retornar un array de productos', async () => {
      const resultado = await servicio.buscarTodos();

      expect(prismaMock.producto.findMany).toHaveBeenCalled();
      expect(resultado).toEqual([productoMock]);
    });
  });

  describe('buscarUno', () => {
    it('deberia retornar un producto por id', async () => {
      const resultado = await servicio.buscarUno('uuid');

      expect(prismaMock.producto.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid' } });
      expect(resultado).toEqual(productoMock);
    });

    it('deberia lanzar NotFoundException cuando el producto no existe', async () => {
      prismaMock.producto.findUnique.mockResolvedValue(null);

      await expect(servicio.buscarUno('no-existe')).rejects.toThrow(NotFoundException);
      expect(prismaMock.producto.findUnique).toHaveBeenCalledWith({ where: { id: 'no-existe' } });
    });
  });

  describe('actualizar', () => {
    it('deberia actualizar un producto', async () => {
      const dtoActualizarProducto: UpdateProductDto = { precio: 15, stock: 10 };
      prismaMock.producto.findUnique.mockResolvedValue(productoMock);

      const resultado = await servicio.actualizar('uuid', dtoActualizarProducto);

      expect(prismaMock.producto.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid' } });
      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id: 'uuid' },
        data: dtoActualizarProducto,
      });
      expect(resultado).toEqual(productoMock);
    });

    it('deberia lanzar NotFoundException cuando se actualiza un producto inexistente', async () => {
      prismaMock.producto.findUnique.mockResolvedValue(null);

      await expect(servicio.actualizar('no-existe', { precio: 15 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('eliminar', () => {
    it('deberia eliminar un producto', async () => {
      prismaMock.producto.findUnique.mockResolvedValue(productoMock);

      const resultado = await servicio.eliminar('uuid');

      expect(prismaMock.producto.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid' } });
      expect(prismaMock.producto.delete).toHaveBeenCalledWith({ where: { id: 'uuid' } });
      expect(resultado).toEqual({ eliminado: true });
    });

    it('deberia lanzar NotFoundException cuando se elimina un producto inexistente', async () => {
      prismaMock.producto.findUnique.mockResolvedValue(null);

      await expect(servicio.eliminar('no-existe')).rejects.toThrow(NotFoundException);
    });
  });
});
