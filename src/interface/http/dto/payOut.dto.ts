import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Currency } from '@src/domain/enums/currency.enum';
import { Type } from 'class-transformer';

class ReceiverDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  iban?: string;

  @IsOptional()
  @IsString()
  paparaAccountNo?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class PayOutDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
  @IsEnum(Currency)
  currency!: Currency;

  @ValidateNested()
  @Type(() => ReceiverDto)
  receiver!: ReceiverDto;

  @IsOptional()
  description?: string;
}
