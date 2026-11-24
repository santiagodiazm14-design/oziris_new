import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PAYMENT_METHODS } from '../plans';

const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class SimulateSubscriptionDto {
  @ApiProperty({ enum: ['PLUS', 'PREMIUM'], example: 'PLUS' })
  @Transform(upper)
  @IsIn(['PLUS', 'PREMIUM'], { message: 'Plan inválido.' })
  plan: 'PLUS' | 'PREMIUM';

  @ApiProperty({ enum: ['MONTHLY', 'YEARLY'], example: 'MONTHLY' })
  @Transform(upper)
  @IsIn(['MONTHLY', 'YEARLY'], { message: 'Periodo inválido.' })
  period: 'MONTHLY' | 'YEARLY';

  @ApiPropertyOptional({ enum: PAYMENT_METHODS, default: 'PSE' })
  @IsOptional()
  @IsIn(PAYMENT_METHODS, { message: 'Método de pago inválido.' })
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  payerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  payerEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  payerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  payerDocument?: string;

  @ApiPropertyOptional({ description: 'Solo se guardan los últimos 4 dígitos' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  cardLastFour?: string;
}
