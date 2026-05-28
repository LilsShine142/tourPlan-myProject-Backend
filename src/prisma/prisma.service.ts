import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg'; // Phải import Pool từ thư viện pg
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Tạo Pool kết nối từ thư viện pg
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    
    // 2. Bọc Pool đó bằng PrismaPg Adapter
    const adapter = new PrismaPg(pool);
    
    // 3. Khởi tạo Prisma với adapter vừa tạo
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('[Prisma] Kết nối thành công tới Database PostgreSQL!');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('[Prisma] Đã ngắt kết nối Database an toàn.');
  }
}