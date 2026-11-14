import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class AdminListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  page?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  limit?: string;
}

export class AdminUpdateStoreDto {
  /** Suspende (false) ou reativa (true) a loja; ela sai ou volta da busca. */
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
