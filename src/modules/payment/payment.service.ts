import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from '@shared/enums/payment-status.enum';

@Injectable()
export class PaymentService {
   constructor(
      @InjectRepository(Payment)
      private readonly paymentRepository: Repository<Payment>,
      @InjectRepository(Order)
      private readonly orderRepository: Repository<Order>,
   ) {}

   async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
      const order = await this.orderRepository.findOne({
         where: { id: createPaymentDto.orderId },
      });
      if (!order) {
         throw new NotFoundException('Order not found');
      }

      const payment = this.paymentRepository.create({
         ...createPaymentDto,
         order,
         status: PaymentStatus.COMPLETED,
      });

      return this.paymentRepository.save(payment);
   }

   async findAll(): Promise<Payment[]> {
      return this.paymentRepository.find({ relations: ['order'] });
   }

   async findByOrder(orderId: string): Promise<Payment[]> {
      return this.paymentRepository.find({
         where: { order: { id: orderId } },
         relations: ['order'],
      });
   }

   async findOne(id: string): Promise<Payment> {
      const payment = await this.paymentRepository.findOne({
         where: { id },
         relations: ['order'],
      });
      if (!payment) {
         throw new NotFoundException('Payment not found');
      }
      return payment;
   }

   async update(
      id: string,
      updatePaymentDto: UpdatePaymentDto,
   ): Promise<Payment> {
      const payment = await this.findOne(id);
      return this.paymentRepository.save({ ...payment, ...updatePaymentDto });
   }

   async refund(id: string): Promise<Payment> {
      const payment = await this.findOne(id);
      payment.status = PaymentStatus.REFUNDED;
      return this.paymentRepository.save(payment);
   }

   async remove(id: string): Promise<void> {
      const payment = await this.findOne(id);
      await this.paymentRepository.remove(payment);
   }

   async getTotalPaid(orderId: string): Promise<number> {
      const payments = await this.findByOrder(orderId);
      return payments
         .filter((p) => p.status === PaymentStatus.COMPLETED)
         .reduce((total, payment) => total + payment.amount, 0);
   }
}
