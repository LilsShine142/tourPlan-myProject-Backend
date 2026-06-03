import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';

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

  async getMyTrips(userId: string) {
    // Lấy tất cả các chuyến đi mà user này là thành viên
    return await this.prisma.trip.findMany({
      where: {
        members: {
          some: { userId: userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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