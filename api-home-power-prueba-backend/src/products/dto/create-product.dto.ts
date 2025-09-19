import { IsString, IsNotEmpty, IsNumber, Min, IsInt } from 'class-validator';

/**
 * DTO (Data Transfer Object) para crear productos
 */
export class CreateProductDto {
  // Validaciónes:
  @IsString()
  @IsNotEmpty()
  nombre: string;
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio: number;

  // Validación del campo stock:
  // @IsInt() - debe ser un número entero (no decimal)
  // @Min(0) - valor mínimo 0 (no se permite stock negativo)
  @IsInt()
  @Min(0)
  stock: number;
}
