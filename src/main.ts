import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 4000;

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('URL Shortener')
    .setDescription('API for shortened URL')
    .setVersion('1.0')
    .addTag('urls')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api', app, document, {
    explorer: true,
    swaggerOptions: {
      defaultModelsExpandDepth: -1, // Jangan tampilkan schema model otomatis
      supportedSubmitMethods: ['get', 'post', 'put', 'delete'], // Hilangkan "try it out" untuk method tertentu
    },
  });

  await app.listen(port);
  console.log(`Listening to port: ${port}`);
}
bootstrap();
