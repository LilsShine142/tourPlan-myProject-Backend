import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { GetGroupsQueryDto } from './dto/get-groups-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async createGroup(userId: string, userName: string, dto: CreateGroupDto) {
    return await this.prisma.group.create({
      data: {
        ...dto,
        createdBy: userId,
        memberCount: 1,
        members: {
          create: {
            userId: userId,
            name: userName,
            role: 'admin',
            status: 'accepted',
          },
        },
      },
      include: { members: true },
    });
  }

  async getMyGroups(userId: string, query: GetGroupsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.GroupWhereInput = {
      members: { some: { userId, status: 'accepted' } },
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.group.count({ where }),
      this.prisma.group.findMany({
        where,
        take: limit,
        skip,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return {
      object: 'list',
      data,
      pagination: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addMemberToGroup(groupId: string, dto: AddMemberDto) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra nhóm có tồn tại không
      const group = await tx.group.findUnique({ where: { id: groupId } });
      if (!group) throw new NotFoundException('Không tìm thấy nhóm');

      // 2. Nếu có truyền userId, kiểm tra trùng lặp thành viên
      if (dto.userId) {
        const exist = await tx.groupMember.findFirst({ where: { groupId, userId: dto.userId } });
        if (exist) throw new BadRequestException('Tài khoản này đã có trong nhóm');
      }

      // 3. Tạo thành viên mới
      const newMember = await tx.groupMember.create({
        data: {
          groupId,
          userId: dto.userId || null,
          name: dto.name,
          avatarUrl: dto.avatarUrl,
          role: dto.role,
          status: 'accepted', // Chấp nhận luôn để tiện sử dụng
        },
      });

      // 4. Cập nhật số lượng thành viên trong Group model
      await tx.group.update({
        where: { id: groupId },
        data: { memberCount: { increment: 1 } },
      });

      return newMember;
    });
  }
}