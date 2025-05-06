import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   app.enableCors({
      origin: true,
      credentials: true,
   });

   app.use(cookieParser());

   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         forbidNonWhitelisted: true,
         transform: true,
      }),
   );

   // Global filters
   app.useGlobalFilters(new HttpExceptionFilter());

   // Enable versioning
   app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
   });

   // Swagger setup
   const config = new DocumentBuilder()
      .setTitle('Restaurant Management System API')
      .setDescription('The Restaurant Management System API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
   const document = SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('api', app, document);

   const port = process.env.PORT || 3000;
   await app.listen(port);
}
bootstrap();
