import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // log: ['query', 'info', 'warn', 'error'], // Uncomment for query logging
    });
  }
  async onModuleInit() {
    await this.$connect();
    console.log('Prisma Client connected to the database.');
  }
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma Client disconnected from the database.');
  }
}
