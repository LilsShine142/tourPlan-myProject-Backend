import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { PaymentStatus } from '@prisma/client';
import { GetBillsQueryDto } from './dto/get-bills-query.dto';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async createBill(dto: CreateBillDto) {
    const totalOwe = dto.splits.reduce((sum, item) => sum + item.calculatedOwe, 0);
    if (Math.abs(totalOwe - dto.amount) > 1) {
      throw new BadRequestException('Tổng số tiền chia calculatedOwe phải bằng tổng tiền hóa đơn amount');
    }

    return await this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.create({
        data: {
          groupId: dto.groupId,
          title: dto.title,
          amount: dto.amount,
          currency: dto.currency,
          category: dto.category,
          date: dto.date ? new Date(dto.date) : new Date(),
          imageUrls: dto.imageUrls || [],
          paidBy: dto.paidBy,
          splitMethod: dto.splitMethod,
        },
      });

      const splitsData = dto.splits.map((s) => ({
        billId: bill.id,
        groupMemberId: s.groupMemberId,
        shareValue: s.shareValue,
        calculatedOwe: s.calculatedOwe,
        isPaid: s.groupMemberId === dto.paidBy, // Nếu chính người trả gánh phần này thì coi như xong
      }));

      await tx.billSplit.createMany({ data: splitsData });
      return bill;
    });
  }

  async getGroupBalances(groupId: string, currentUserId: string) {
    // 1. Tìm định danh GroupMember của chính User đang đăng nhập trong nhóm này
    const currentMember = await this.prisma.groupMember.findFirst({
      where: { groupId, userId: currentUserId },
    });
    if (!currentMember) throw new BadRequestException('Bạn không thuộc nhóm chi tiêu này');

    // 2. Lấy toàn bộ thành viên, hóa đơn và các giao dịch trả nợ ngoài đời đã DUYỆT (confirmed)
    const members = await this.prisma.groupMember.findMany({ where: { groupId } });
    const bills = await this.prisma.bill.findMany({ where: { groupId }, include: { splits: true } });
    const completedPayments = await this.prisma.payment.findMany({ where: { groupId, status: PaymentStatus.confirmed } });

    // 3. Tính toán cán cân tài chính ròng từng GroupMember
    const netBalances: Record<string, number> = {};
    members.forEach((m) => (netBalances[m.id] = 0));

    bills.forEach((bill) => {
      if (netBalances[bill.paidBy] !== undefined) netBalances[bill.paidBy] += bill.amount;
      bill.splits.forEach((split) => {
        if (netBalances[split.groupMemberId] !== undefined) netBalances[split.groupMemberId] -= split.calculatedOwe;
      });
    });

    completedPayments.forEach((pay) => {
      if (netBalances[pay.payerId] !== undefined) netBalances[pay.payerId] += pay.amount;
      if (netBalances[pay.receiverId] !== undefined) netBalances[pay.receiverId] -= pay.amount;
    });

    // 4. Thuật toán khớp nợ tối ưu (Greedy Debt Matching)
    const debtors = members.map((m) => ({ id: m.id, name: m.name, bal: netBalances[m.id] })).filter((x) => x.bal < -1).sort((a, b) => a.bal - b.bal);
    const creditors = members.map((m) => ({ id: m.id, name: m.name, bal: netBalances[m.id] })).filter((x) => x.bal > 1).sort((a, b) => b.bal - a.bal);

    const allDebts: any[] = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const owe = Math.min(Math.abs(debtor.bal), creditor.bal);

      allDebts.push({
        fromMemberId: debtor.id,
        fromMemberName: debtor.name,
        toMemberId: creditor.id,
        toMemberName: creditor.name,
        amount: Math.round(owe),
      });

      debtor.bal += owe;
      creditor.bal -= owe;
      if (Math.abs(debtor.bal) <= 1) i++;
      if (creditor.bal <= 1) j++;
    }

    // 5. Lọc riêng dữ liệu cho cá nhân đang xem app
    return {
      myMemberId: currentMember.id,
      myNetBalance: Math.round(netBalances[currentMember.id] || 0),
      myDebts: allDebts.filter((d) => d.fromMemberId === currentMember.id), // Khoản mình cần bấm nút trả tiền
      myCredits: allDebts.filter((d) => d.toMemberId === currentMember.id), // Khoản người ta nợ mình
      allGroupDebts: allDebts,
    };
  }

  async getGroupBills(groupId: string, query: GetBillsQueryDto, currentUserId: string) {
    // 1. Bảo mật: Kiểm tra xem User đang log có thuộc nhóm này không
    const currentMember = await this.prisma.groupMember.findFirst({
      where: { groupId, userId: currentUserId },
    });
    if (!currentMember) {
      throw new BadRequestException('Bạn không có quyền truy cập vào lịch sử chi tiêu của nhóm này');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { search, category } = query;
    const skip = (page - 1) * limit;

    // 2. Xây dựng Object điều kiện lọc động (Dynamic Where Clause)
    const whereClause: any = { groupId };

    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive', // Tìm kiếm không phân biệt hoa thường nguyên bản của Prisma
      };
    }

    if (category) {
      whereClause.category = category;
    }

    // 3. Sử dụng Promise.all để đếm tổng số lượng bill và query data phân trang song song (Tối ưu performance)
    const [total, data] = await Promise.all([
      this.prisma.bill.count({ where: whereClause }),
      this.prisma.bill.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          splits: true, // Trả về chi tiết các thành viên gánh nợ của từng hóa đơn
        },
        orderBy: {
          date: 'desc', // Hóa đơn chi tiêu gần đây nhất xếp lên đầu
        },
      }),
    ]);

    // 4. Trả về cấu trúc bọc chuẩn để trùng khớp với TransformInterceptor của bạn
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}