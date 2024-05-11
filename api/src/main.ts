import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
    .setTitle('ReadCraftAcademyAPI')
    .setDescription('This is a read craft academy api documentation')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    credentials: true,
    origin: true,
  });

  createDirectory(process.env.LESSON_DIR);
  createDirectory(process.env.BOOK_DIR);
  createDirectory(process.env.IMAGE_DIR);

  await app.listen(3000);
}

function createDirectory(directory: string) {
  fs.access(directory, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdir(directory, { recursive: true }, (err) => {
        if (err) {
          console.error('Error creating directory:', err);
        } else {
          console.log(`Directory ${directory} created successfully`);
        }
      });
    } else {
      console.log(`Directory ${directory} already exists`);
    }
  });
}

bootstrap();
