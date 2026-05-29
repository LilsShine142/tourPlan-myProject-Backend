import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { UploadModule } from './common/upload/upload.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        // 1. Khởi tạo và await Redis Store riêng ở bên ngoài
        const store = await redisStore({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
          ttl: 60 * 60 * 1000, // 60 phút
        });

        // 2. Trả về cấu hình dạng hàm () => store để vừa lòng cache-manager v5
        return {
          store: () => store, 
        };
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}