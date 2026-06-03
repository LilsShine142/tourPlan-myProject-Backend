import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { GetTripsQueryDto } from './dto/get-trips-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async createTrip(createTripDto: CreateTripDto, userId: string) {
    const { groupId, ...tripData } = createTripDto;

    // Tiến hành tạo Trip và tự động add User tạo vào bảng TripMember
    return await this.prisma.trip.create({
      data: {
        ...tripData,
        createdBy: userId,
        groupId: groupId || null,
        members: {
          create: {
            userId: userId,
            isOwner: true, // Người tạo mặc định là chủ chuyến đi
          },
        },
      },
      include: {
        members: true, // Trả về kèm danh sách thành viên để check
      },
    });
  }

  async getMyTrips(userId: string, query: GetTripsQueryDto) {
    const { limit, offset, search, status } = query;

    // 1. Xây dựng điều kiện lọc (Bắt buộc user phải là thành viên chuyến đi)
    const whereCondition: Prisma.TripWhereInput = {
      members: {
        some: { userId: userId },
      },
    };

    // Lọc theo trạng thái nếu có
    if (status) {
      whereCondition.status = status;
    }

    // Lọc theo từ khóa search (Không phân biệt hoa thường nhờ mode: 'insensitive')
    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 2. Chạy song song 2 câu lệnh: Đếm tổng số và Lấy data phân trang (Tối ưu performance)
    const [total, trips] = await this.prisma.$transaction([
      this.prisma.trip.count({ where: whereCondition }),
      this.prisma.trip.findMany({
        where: whereCondition,
        take: limit,  // Số lượng lấy
        skip: offset, // Số lượng bỏ qua
        orderBy: { createdAt: 'desc' },
        include: {
          // Trả thêm thông tin rút gọn của thành viên để hiển thị avatar ngoài danh sách
          members: {
            include: {
              user: { select: { displayName: true, avatarUrl: true } }
            }
          }
        }
      }),
    ]);

    // 3. Trả về cấu trúc phân trang chuẩn chỉnh
    return {
      object: 'list',
      data: trips,
      pagination: {
        total,
        limit,
        offset,
      }
    };
  }

  async getTripDetails(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: { include: { user: { select: { id: true, displayName: true, avatarUrl: true } } } },
        destinations: {
          orderBy: { sequence: 'asc' }, // Sắp xếp chặng theo thứ tự thời gian
          include: {
            places: {
              orderBy: { sequence: 'asc' }, // Sắp xếp địa điểm theo thứ tự
            },
          },
        },
      },
    });

    if (!trip) throw new NotFoundException('Không tìm thấy chuyến đi');
    return trip;
  }

  async addMemberToTrip(tripId: string, userId: string) {
    // Check xem user đã có trong trip chưa
    const existingMember = await this.prisma.tripMember.findFirst({
      where: { tripId, userId },
    });
    if (existingMember) throw new BadRequestException('Người dùng đã là thành viên của chuyến đi này');

    return await this.prisma.tripMember.create({
      data: {
        tripId,
        userId,
        isOwner: false, // Mặc định được mời vào thì chỉ là member thường
      },
    });
  }

  async removeMember(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findFirst({
      where: { tripId, userId },
    });
    if (!member) throw new NotFoundException('Thành viên không tồn tại trong chuyến đi');
    if (member.isOwner) throw new BadRequestException('Không thể xóa chủ sở hữu chuyến đi');

    return await this.prisma.tripMember.delete({
      where: { id: member.id },
    });
  }
}