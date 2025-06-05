import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'], // For more detailed logging
  });
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: '*', // TODO: Restrict in production!
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Restaurant Management System API')
    .setDescription('API documentation for the Restaurant Management System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Name this security scheme for @ApiBearerAuth('JWT-auth')
    )
    .addTag('Authentication', 'User authentication operations')
    .addTag('Staff Management', 'Operations related to staff members')
    .addTag('Menu & Categories', 'Manage menu items and categories')
    .addTag(
      'Inventory Management (Ingredients)',
      'Manage ingredients and stock levels',
    )
    .addTag(
      'Recipe Management',
      'Manage recipes and their ingredient compositions',
    )
    .addTag('Table Management', 'Manage restaurant tables')
    .addTag('Reservation Management', 'Manage customer reservations')
    .addTag('Order Management', 'Manage customer orders')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  logger.log('Swagger API documentation available at /api-docs');

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`NestJS application successfully started.`);
}
bootstrap();
