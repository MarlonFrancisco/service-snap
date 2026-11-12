import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../utils/dto/pagination.dto';
import { MAX_CUSTOMER_TAGS } from './customer.helpers';

export class CustomerQueryDto extends PaginationQueryDto {
  @IsString()
  @MaxLength(30)
  @IsOptional()
  tag?: string;
}

export class UpdateCustomerDto {
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string | null;

  @IsArray()
  @ArrayMaxSize(MAX_CUSTOMER_TAGS)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  @IsOptional()
  tags?: string[];
}

/** Cadastro manual: precisa de nome e de telefone ou e-mail. */
export class CreateCustomerDto extends UpdateCustomerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName: string;

  @IsString()
  @MaxLength(60)
  @IsOptional()
  lastName?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  telephone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
