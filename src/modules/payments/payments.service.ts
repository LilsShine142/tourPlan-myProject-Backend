import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // 1. Tạo yêu cầu thanh toán
  async createPayment(dto: CreatePaymentDto) {
    if (dto.payerId === dto.receiverId) {
      throw new BadRequestException('Bạn không thể tự thanh toán cho chính mình');
    }
    return await this.prisma.payment.create({
      data: { ...dto, status: PaymentStatus.pending },
    });
  }

  // 2. Lấy danh sách thông báo cần xử lý của chủ nợ
  async getPendingRequests(currentUserId: string) {
    return await this.prisma.payment.findMany({
      where: {
        status: 'pending',
        // Tìm những giao dịch mà Người nhận có liên kết tới tài khoản của User đang login
        group: {
          members: {
            some: { userId: currentUserId, role: { in: ['admin', 'member'] } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 3. Xử lý Duyệt hoặc Từ chối giao dịch thanh toán
  async handleReviewPayment(paymentId: string, currentUserId: string, action: 'approve' | 'reject') {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { group: { include: { members: true } } }
    });

    if (!payment) throw new NotFoundException('Không tìm thấy bản ghi giao dịch này');
    if (payment.status !== 'pending') throw new BadRequestException('Giao dịch này đã được xử lý rồi');

    // Bảo mật: Tìm xem trong Group đó, GroupMember gánh vai trò receiverId có đúng là của User đang đăng nhập không
    const targetReceiverMember = payment.group.members.find(m => m.id === payment.receiverId);
    if (!targetReceiverMember || targetReceiverMember.userId !== currentUserId) {
      throw new BadRequestException('Bạn không phải là chủ nợ thực sự của bill này để có quyền phê duyệt!');
    }

    return await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: action === 'approve' ? PaymentStatus.confirmed : PaymentStatus.cancelled },
    });
  }
}