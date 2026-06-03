import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { GroupCurrency } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 'group-uuid' })
  @IsString() @IsNotEmpty()
  groupId!: string;

  @ApiPropertyOptional({ example: 'bill-uuid-nếu-muốn-trả-đích-danh-hóa-đơn' })
  @IsString() @IsOptional()
  billId?: string;

  @ApiProperty({ example: 'member-uuid-payer', description: 'ID GroupMember của bạn (người chuyển tiền)' })
  @IsString() @IsNotEmpty()
  payerId!: string;

  @ApiProperty({ example: 'member-uuid-receiver', description: 'ID GroupMember của chủ nợ (người nhận tiền)' })
  @IsString() @IsNotEmpty()
  receiverId!: string;

  @ApiProperty({ example: 150000 })
  @IsNumber() @IsNotEmpty()
  amount!: number;

  @ApiProperty({ enum: GroupCurrency, example: 'VND' })
  @IsEnum(GroupCurrency)
  currency!: GroupCurrency;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/screenshot.jpg', description: 'Ảnh chụp bill chuyển khoản' })
  @IsString() @IsOptional()
  proofUrl?: string;

  @ApiPropertyOptional({ example: 'Tớ trả tiền lẩu hôm qua nha' })
  @IsString() @IsOptional()
  note?: string;
}