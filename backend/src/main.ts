import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 4000;
  const origins = configService.get<string[]>('app.frontendOrigins') ?? [
    'http://localhost:3000',
  ];

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    credentials: true,
    origin: origins,
  });
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
}
void bootstrap();
