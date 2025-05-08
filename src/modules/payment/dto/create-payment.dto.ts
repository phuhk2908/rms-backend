import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../shared/enums/payment-method.enum';

export class CreatePaymentDto {
  @IsUUID()
  @ApiProperty({ description: 'The ID of the associated order' })
  orderId: string;

  @IsEnum(PaymentMethod)
  @ApiProperty({ description: 'The payment method used', enum: PaymentMethod })
  method: PaymentMethod;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @ApiProperty({ description: 'The transaction ID (optional)', required: false })
  @IsOptional()
  transactionId?: string;

  @IsString()
  @ApiProperty({ description: 'Any notes related to the payment (optional)', required: false })
  @IsOptional()
  notes?: string;
}
