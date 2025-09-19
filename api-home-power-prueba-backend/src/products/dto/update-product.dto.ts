import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * DTO (Data Transfer Object) para actualizar productos
 *
 * Este DTO permite actualizaciones parciales de productos, donde solo se envían
 * los campos que se desean actualizar. Utiliza el patrón de herencia para reutilizar
 * las validaciones del CreateProductDto.
 *
 * PartialType es una utilidad de @nestjs/mapped-types que:
 * - Toma todas las propiedades de CreateProductDto
 * - Las convierte en opcionales (agrega ? a cada propiedad)
 * - Mantiene todas las validaciones originales
 * - Permite enviar solo los campos que se quieren actualizar
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
