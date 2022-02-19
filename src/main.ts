import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();

function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder().setTitle('원티드 API 문서').build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/', app, document);
}
