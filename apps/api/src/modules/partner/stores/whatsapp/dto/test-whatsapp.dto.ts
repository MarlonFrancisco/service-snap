import { Matches, MinLength } from 'class-validator';

export class TestWhatsappDto {
  /** Digits with country code, optional leading + / spaces (normalized in service). */
  @MinLength(10)
  @Matches(/^\+?[\d\s()-]{10,20}$/, {
    message:
      'Informe um telefone válido com DDI (ex.: 5511999999999 ou +55 11 99999-9999).',
  })
  to: string;
}
