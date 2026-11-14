import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentInputDto } from '../../cash/dto/cash.dto';

export class CreateCheckoutDto {
  /** Atendimentos da mesma visita (mesmo cliente). */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  scheduleIds: string[];

  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => PaymentInputDto)
  payments: PaymentInputDto[];

  /** Dá baixa no pacote do cliente quando há saldo (padrão: sim). */
  @IsOptional()
  @IsBoolean()
  usePackages?: boolean;

  @IsOptional()
  @IsUUID()
  rewardId?: string;

  /** Desconto manual, em reais, além do da recompensa. */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
