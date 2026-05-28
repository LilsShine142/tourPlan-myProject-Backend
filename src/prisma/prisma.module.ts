import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Thêm @Global() để dùng ở mọi nơi mà không cần import lại module này
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Phải export ra nhé
})
export class PrismaModule {}