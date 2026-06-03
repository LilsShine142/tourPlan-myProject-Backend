import { Controller, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service';
import { CreateDestinationDto, CreatePlaceItemDto } from './dto/create-destination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Destinations & Places')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destService: DestinationsService) {}

  // ================= DESTINATION (CHẶNG) =================
  @Post()
  @ApiOperation({ summary: 'Tạo chặng dừng chân mới cho chuyến đi' })
  async createDestination(@Body() dto: CreateDestinationDto) {
    const data = await this.destService.createDestination(dto);
    return { message: 'Tạo chặng dừng chân thành công', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa chặng dừng chân (Kéo theo xóa luôn các địa điểm bên trong)' })
  @ApiParam({ name: 'id', description: 'ID của Destination' })
  async deleteDestination(@Param('id') id: string) {
    await this.destService.deleteDestination(id);
    return { message: 'Xóa chặng thành công' };
  }

  // ================= PLACE ITEM (ĐỊA ĐIỂM) =================
  @Post(':destinationId/places')
  @ApiOperation({ summary: 'Thêm địa điểm cụ thể vào một chặng' })
  @ApiParam({ name: 'destinationId', description: 'ID của chặng dừng' })
  async addPlace(
    @Param('destinationId') destId: string,
    @Body() dto: CreatePlaceItemDto,
  ) {
    const data = await this.destService.addPlaceToDestination(destId, dto);
    return { message: 'Thêm địa điểm vào chặng thành công', data };
  }

  @Delete('places/:placeId')
  @ApiOperation({ summary: 'Xóa một địa điểm khỏi chặng' })
  @ApiParam({ name: 'placeId', description: 'ID của địa điểm (PlaceItem)' })
  async deletePlace(@Param('placeId') placeId: string) {
    await this.destService.deletePlace(placeId);
    return { message: 'Xóa địa điểm thành công' };
  }
}