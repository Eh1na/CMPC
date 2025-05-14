import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Middlewares básicos
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  // Configuración CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization', 'Content-Disposition'],
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API CMPC Libros')
    .setDescription('Sistema de gestión de libros para CMPC')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Servir archivos estáticos desde uploads/books
  app.useStaticAssets(join(__dirname, '..', 'uploads', 'books'), {
    prefix: '/books/images',
    setHeaders: (res) => {
      res.set('Cache-Control', 'public, max-age=31536000');
    },
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Serving static files from: ${join(__dirname, '..', 'uploads', 'books')}`);
  console.log(`Swagger documentation: ${await app.getUrl()}/api/docs`);
}
bootstrap();