// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Cấu hình CORS ---
  // Cho phép frontend từ localhost:8080 (hoặc cổng nào frontend của bạn chạy)
  // truy cập API của backend.
  app.enableCors({
    origin: 'http://localhost:8080', // RẤT QUAN TRỌNG: Thay đổi cổng này nếu frontend của bạn chạy ở cổng khác
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép gửi cookie và header xác thực (nếu có)
  });
  // --- Kết thúc cấu hình CORS ---

  await app.listen(3000); // Backend sẽ chạy trên cổng 3000
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();