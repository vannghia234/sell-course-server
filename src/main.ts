import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes';
import { SwaggerModule } from '@nestjs/swagger';
import { configSwagger } from './lib/config/swagger.config';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResponseFormatInterceptor } from './lib/shared/interceptor/res.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors();
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe());
  const document = SwaggerModule.createDocument(app, configSwagger);
  app.useGlobalInterceptors(new ResponseFormatInterceptor());

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.APP_PORT);
  const url = await app.getUrl();

  new Logger('main').debug('Server is running on port ' + process.env.APP_PORT);
  new Logger('main').debug(`Go to swagger ${url}/api/`);
}
bootstrap();
