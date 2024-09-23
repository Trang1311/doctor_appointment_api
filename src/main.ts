import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as requestIp from 'request-ip';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  });

  const config = new DocumentBuilder()
    .setTitle('Doctor_Appointments_Api')
    .addBearerAuth()
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@127.0.0.1:5672'],
      queue: 'topic_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.useStaticAssets(join(__dirname, '..', 'sounds'));

  app.use(requestIp.mw());
  await app.startAllMicroservices();
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
