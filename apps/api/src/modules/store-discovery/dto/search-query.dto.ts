import { IsIn, IsOptional, IsString } from 'class-validator';

/** Query string do `GET /search`; números e booleano chegam como texto. */
export class SearchQueryDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  category?: string;

  /** Nota média mínima, de 1 a 5. */
  @IsIn(['1', '2', '3', '4', '4.5', '5'])
  @IsOptional()
  minRating?: string;

  /** Só lojas com algum horário livre hoje, no fuso de cada loja. */
  @IsIn(['true', 'false'])
  @IsOptional()
  availableToday?: string;
}
