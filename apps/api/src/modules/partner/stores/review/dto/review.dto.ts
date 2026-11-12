import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { User } from '../../../../users/user.entity';
import type { Store } from '../../store.entity';

export class ReviewDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  /**
   * Atendimento avaliado. Sem ele, vale o atendimento concluído mais recente
   * do cliente nesta loja que ainda não foi avaliado.
   */
  @IsUUID()
  @IsOptional()
  scheduleId?: string;

  @IsObject()
  user: Partial<User>;

  @IsObject()
  @IsOptional()
  store: Partial<Store>;
}

export class ReviewReplyDto {
  /** Texto vazio apaga a resposta. */
  @IsString()
  @MaxLength(1000)
  reply: string;
}
