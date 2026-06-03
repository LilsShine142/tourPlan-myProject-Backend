import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetBillsQueryDto } from './dto/get-bills-query.dto';

@ApiTags('Bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo hóa đơn chi tiêu mới' })
  async createBill(@Body() dto: CreateBillDto) {
    const data = await this.billsService.createBill(dto);
    return { message: 'Tạo hóa đơn thành công', data };
  }

  @Get('group/:groupId/balances')
  @ApiOperation({ summary: 'Xem sơ đồ nợ tay đôi chi tiết (Gồm mục Tôi nợ ai / Ai nợ tôi)' })
  async getGroupBalances(@Param('groupId') groupId: string, @CurrentUser() user: any) {
    const data = await this.billsService.getGroupBalances(groupId, user.id);
    return { message: 'Tính toán công nợ thành công', data };
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Lấy danh sách lịch sử hóa đơn của Nhóm (Có phân trang, search, filter)' })
  async getGroupBills(
    @Param('groupId') groupId: string,
    @Query() query: GetBillsQueryDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.billsService.getGroupBills(groupId, query, user.id);
    
    // Trải (spread) data và pagination ra để TransformInterceptor xử lý định dạng JSON thống nhất toàn dự án
    return {
      message: 'Lấy danh sách lịch sử hóa đơn thành công',
      ...result,
    };
  }
}