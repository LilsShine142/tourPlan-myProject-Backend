import { Controller, Post, Get, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo chuyến đi mới' })
  @ApiResponse({ status: 201, description: 'Tạo chuyến đi thành công.' })
  async create(@Body() createTripDto: CreateTripDto, @CurrentUser() user: any) {
    const data = await this.tripsService.createTrip(createTripDto, user.id);
    return { message: 'Tạo chuyến đi thành công', data };
  }

  @Get('my-trips')
  @ApiOperation({ summary: 'Lấy danh sách chuyến đi của tôi' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công.' })
  async getMyTrips(@CurrentUser() user: any) {
    const data = await this.tripsService.getMyTrips(user.id);
    return { message: 'Lấy danh sách chuyến đi thành công', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết chuyến đi (Bao gồm chặng và địa điểm)' })
  @ApiParam({ name: 'id', description: 'ID của chuyến đi' })
  async getTripById(@Param('id') id: string) {
    const data = await this.tripsService.getTripDetails(id);
    return { message: 'Lấy chi tiết chuyến đi thành công', data };
  }

  // --- QUẢN LÝ THÀNH VIÊN CHUYẾN ĐI ---
  @Post(':id/members')
  @ApiOperation({ summary: 'Thêm thành viên vào chuyến đi' })
  @ApiParam({ name: 'id', description: 'ID của chuyến đi' })
  async addMember(
    @Param('id') tripId: string,
    @Body('userId') memberId: string,
  ) {
    const data = await this.tripsService.addMemberToTrip(tripId, memberId);
    return { message: 'Thêm thành viên thành công', data };
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Xóa thành viên hoặc Rời khỏi chuyến đi' })
  @ApiParam({ name: 'id', description: 'ID của chuyến đi' })
  @ApiParam({ name: 'userId', description: 'ID của thành viên cần xóa' })
  async removeMember(
    @Param('id') tripId: string,
    @Param('userId') memberId: string,
  ) {
    await this.tripsService.removeMember(tripId, memberId);
    return { message: 'Xóa thành viên thành công' };
  }
}