import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { UploadModule } from './common/upload/upload.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { TripsModule } from './modules/trips/trips.module';
import { BillsModule } from './modules/bills/bills.module';
import { GroupsModule } from './modules/groups/groups.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExploreModule } from './modules/explore/explore.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisDefaultTtlMs = Number(process.env.REDIS_DEFAULT_TTL_MS || '3600000');

        // 1. Khởi tạo và await Redis Store riêng ở bên ngoài
        const store = await redisStore({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
          ttl: redisDefaultTtlMs,
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
    TripsModule,       
    DestinationsModule, 
    GroupsModule,
    BillsModule,
    PaymentsModule,
    ExploreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}