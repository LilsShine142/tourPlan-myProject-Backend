import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager.Cache,
  ) {}

  // 1. API Lấy thông tin bản thân
  async getMe(userId: string) {
    const cacheKey = `user:${userId}`;
    const cachedUser = await this.cacheManager.get(cacheKey);
    if (cachedUser) return cachedUser; // Interceptor sẽ tự bọc cái này thành { message: "Thành công", data: user }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, displayName: true, avatarUrl: true, coverUrl: true, bio: true, birthday: true },
    });

    await this.cacheManager.set(cacheKey, user, 300000);
    return user; 
  }

  // 2. API Cập nhật thông tin profile
  async updateProfile(userId: string, data: any) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
      },
    });

    await this.cacheManager.del(`user:${userId}`);
    
    // TRẢ VỀ KIỂU NÀY: Interceptor sẽ bốc đúng message ra ngoài, còn data sẽ là null
    return { 
      message: 'Cập nhật thông tin profile thành công!', 
      data: data 
    };
  }

  // 3. API Cập nhật Ảnh đại diện / Ảnh bìa
  async updateImage(userId: string, imageUrl: string, type: 'avatarUrl' | 'coverUrl') {
    await this.prisma.user.update({
      where: { id: userId },
      data: { [type]: imageUrl },
    });

    await this.cacheManager.del(`user:${userId}`);
    
    // TRẢ VỀ KIỂU NÀY: Dữ liệu trả về cực kỳ bóc tách và mạch lạc
    return { 
      message: `Cập nhật ${type === 'avatarUrl' ? 'ảnh đại diện' : 'ảnh bìa'} thành công!`, 
      data: { url: imageUrl } 
    };
  }

  // API cho quản trị
  async getAllUsers(query: GetUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { search, role } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = { is: { name: role } };
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
    ]);

    return {
      object: 'list',
      data: users,
      pagination: { total, limit, page, totalPages: Math.ceil(total / limit) },
    };
  }

  async deleteUser(id: string) {
    // Kiểm tra xem user có tồn tại không
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này');
    }

    // Thực hiện xóa
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: `Đã xóa thành công người dùng có ID: ${id}`,
    };
  }
}