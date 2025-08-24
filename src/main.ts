import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/webhooks', bodyParser.raw({ type: '*/*' }));

  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
}
bootstrap();
