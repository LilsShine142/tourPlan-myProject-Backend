import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDestinationDto, CreatePlaceItemDto } from './dto/create-destination.dto';

@Injectable()
export class DestinationsService {
  constructor(private prisma: PrismaService) {}

  // --- DESTINATIONS ---
  async createDestination(dto: CreateDestinationDto) {
    return await this.prisma.destination.create({ data: dto });
  }

  async deleteDestination(id: string) {
    return await this.prisma.destination.delete({ where: { id } });
  }

  // --- PLACE ITEMS ---
  async addPlaceToDestination(destinationId: string, dto: CreatePlaceItemDto) {
    // Xác nhận chặng tồn tại
    const dest = await this.prisma.destination.findUnique({ where: { id: destinationId } });
    if (!dest) throw new NotFoundException('Không tìm thấy chặng đi này');

    return await this.prisma.placeItem.create({
      data: {
        ...dto,
        destinationId,
      },
    });
  }

  async deletePlace(placeId: string) {
    return await this.prisma.placeItem.delete({ where: { id: placeId } });
  }
}