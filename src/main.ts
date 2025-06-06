import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Áp dụng cookie-parser middleware toàn cục
  app.use(cookieParser());

  // Cấu hình CORS để cho phép frontend kết nối và gửi cookie
  app.enableCors({
    origin: '*', // URL của Next.js frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Quan trọng: cho phép trình duyệt gửi cookie
  });

  // Áp dụng ValidationPipe toàn cục để tự động validate DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Cấu hình Swagger (OpenAPI)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Restaurant Management System API')
    .setDescription('Tài liệu API cho Hệ thống Quản lý Nhà hàng')
    .setVersion('1.2')
    .addCookieAuth('access_token') // Định nghĩa phương thức xác thực bằng cookie
    .addTag('Authentication', 'Xác thực, quản lý phiên và đặt lại mật khẩu')
    .addTag('Staff Management', 'Quản lý nhân viên')
    .addTag('Menu & Categories', 'Quản lý thực đơn và danh mục')
    .addTag('Inventory Management', 'Quản lý kho hàng và nguyên liệu')
    .addTag('Recipe Management', 'Quản lý công thức món ăn')
    .addTag('Table Management', 'Quản lý bàn')
    .addTag('Reservation Management', 'Quản lý đặt chỗ')
    .addTag('Order Management', 'Quản lý đơn hàng')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  logger.log('Swagger API documentation available at /api-docs');

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();