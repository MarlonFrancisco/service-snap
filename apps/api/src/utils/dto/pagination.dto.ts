import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * Paginação opcional das listas. Sem `page`, a rota devolve a lista inteira,
 * como antes, para a web atual continuar funcionando.
 */
export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  search?: string;
}
