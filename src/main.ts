import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthExceptionFilter } from './auth/auth-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AuthExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Moxy REST API')
    .setDescription('Moxy Brand Shop REST API documentation.')
    .setVersion('0.1.0')
    .addTag('futuristic_cowboy')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);
  app.enableCors();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
