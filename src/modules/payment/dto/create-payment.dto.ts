import {
   IsUUID,
   IsEnum,
   IsNumber,
   IsNotEmpty,
   IsOptional,
   IsString,
} from 'class-validator';
import { PaymentMethod } from '../../../shared/enums/payment-method.enum';

export class CreatePaymentDto {
   @IsUUID()
   orderId: string;

   @IsEnum(PaymentMethod)
   method: PaymentMethod;

   @IsNumber()
   @IsNotEmpty()
   amount: number;

   @IsString()
   @IsOptional()
   transactionId?: string;

   @IsString()
   @IsOptional()
   notes?: string;
}
