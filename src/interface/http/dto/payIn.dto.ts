import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Currency } from '@src/domain/enums/currency.enum';

export class PayInDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsEnum(Currency)
  currency!: Currency;

  @IsOptional()
  description?: string;
}
