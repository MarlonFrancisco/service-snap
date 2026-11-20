import { IsIn, IsString, MaxLength } from 'class-validator';

export class GrantWhatsappConsentDto {
  /** Versão do texto que o cliente viu na caixa (`checkout-v1`, …). */
  @IsString()
  @MaxLength(40)
  textVersion: string;

  @IsIn(['checkout', 'profile'])
  source: 'checkout' | 'profile';
}
