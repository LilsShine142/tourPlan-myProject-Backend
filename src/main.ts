import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật Validation (để dùng class-validator)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Kích hoạt Interceptor và Filter toàn cục
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('TourPlan API')
    .setDescription('Tài liệu API cho hệ thống TourPlan Backend')
    .setVersion('1.0')
    .addBearerAuth() // Thêm nút điền Token JWT vào Swagger
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Đường dẫn truy cập Swagger

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();