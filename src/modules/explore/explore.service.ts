import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetToursQueryDto } from './dto/get-tours-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExploreService {
  constructor(private prisma: PrismaService) {}

  // 1. Lấy danh sách Tour công khai (Explore Feed)
  async getPublicTours(query: GetToursQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { search } = query;
    const skip = (page - 1) * limit;

    // Điều kiện tiên quyết: Chỉ lấy các Trip được public
    const where: Prisma.TripWhereInput = {
      isPublic: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Chạy transaction đếm tổng và lấy data song song
    const [total, tours] = await this.prisma.$transaction([
      this.prisma.trip.count({ where }),
      this.prisma.trip.findMany({
        where,
        include: {
          creator: {
            select: { id: true, displayName: true, avatarUrl: true, provider: true },
          },
          // Đếm số lượng chặng và địa điểm để FE hiện "Tour 3 ngày 2 đêm, 5 địa điểm"
          _count: {
            select: { destinations: true },
          },
        },
        orderBy: { createdAt: 'desc' }, // Tour mới nhất lên đầu
        take: limit,
        skip,
      }),
    ]);

    return {
      object: 'list',
      data: tours,
      pagination: { total, limit, page, totalPages: Math.ceil(total / limit) },
    };
  }

  // 2. Lấy chi tiết 1 Tour công khai
  async getTourDetails(id: string) {
    // Tăng lượt view lên 1 mỗi khi có người bấm vào xem chi tiết
    await this.prisma.trip.updateMany({
      where: { id, isPublic: true },
      data: { viewCount: { increment: 1 } },
    });

    const tour = await this.prisma.trip.findFirst({
      where: { id, isPublic: true },
      include: {
        creator: {
          select: { id: true, displayName: true, avatarUrl: true, bio: true },
        },
        destinations: {
          orderBy: { sequence: 'asc' },
          include: {
            places: {
              orderBy: { sequence: 'asc' },
            },
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Không tìm thấy tour này hoặc tour đã bị ẩn!');
    }

    return tour;
  }
}