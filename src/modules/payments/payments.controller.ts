import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Người nợ gửi báo cáo đã chuyển khoản kèm hình ảnh minh chứng' })
  async createPayment(@Body() dto: CreatePaymentDto) {
    const data = await this.paymentsService.createPayment(dto);
    return { message: 'Gửi yêu cầu thanh toán thành công, vui lòng đợi chủ nợ duyệt!', data };
  }

  @Get('pending-requests')
  @ApiOperation({ summary: 'Chủ nợ lấy danh sách các yêu cầu thanh toán đang chờ mình duyệt 🔔' })
  async getPendingRequests(@CurrentUser() user: any) {
    const data = await this.paymentsService.getPendingRequests(user.id);
    return { message: 'Lấy danh sách yêu cầu chờ duyệt thành công', data };
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Chủ nợ bấm DUYỆT giao dịch' })
  async approvePayment(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.paymentsService.handleReviewPayment(id, user.id, 'approve');
    return { message: 'Đã phê duyệt thanh toán, số tiền nợ đã được cấn trừ!', data };
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Chủ nợ bấm TỪ CHỐI giao dịch' })
  async rejectPayment(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.paymentsService.handleReviewPayment(id, user.id, 'reject');
    return { message: 'Đã từ chối giao dịch thanh toán này', data };
  }
}